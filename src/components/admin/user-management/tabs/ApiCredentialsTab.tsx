import React, { useState } from 'react';
import { useSecureApiCredentials } from '@/hooks/useSecureApiCredentials';
import { useCompleteUserManagement } from '@/hooks/useCompleteUserManagement';

const ApiCredentialsTab: React.FC = () => {
  const {
    credentials,
    isLoading,
    error,
    saveCredential,
    updateCredential,
    deleteCredential,
    isSaving,
    isUpdating,
    isDeleting
  } = useSecureApiCredentials();
  const [serviceName, setServiceName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [username, setUsername] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editApiKey, setEditApiKey] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  // Get all users for admin assignment
  const { users: allUsers, isLoading: usersLoading } = useCompleteUserManagement('', 'all', 'all');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName || !apiKey || !selectedUserId || !username) return;
    await saveCredential({ service_name: serviceName, api_key: apiKey, user_id: selectedUserId, username });
    setServiceName('');
    setApiKey('');
    setUsername('');
    setSelectedUserId('');
  };

  const handleEdit = (id: string, apiKeyEncrypted?: string) => {
    setEditId(id);
    setEditApiKey(apiKeyEncrypted ? atob(apiKeyEncrypted) : '');
  };

  const handleUpdate = async (id: string) => {
    if (!editApiKey) return;
    await updateCredential({ id, api_key: editApiKey });
    setEditId(null);
    setEditApiKey('');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this credential?')) {
      await deleteCredential(id);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-3xl font-extrabold mb-6 text-blue-900 flex items-center gap-2">
        <span className="inline-block bg-blue-100 text-blue-700 rounded-full px-3 py-1 text-lg">🔑</span>
        API Credentials
      </h2>
      <form className="mb-8 flex flex-col md:flex-row gap-3 md:gap-4 items-center bg-white shadow rounded-lg p-4 border border-gray-100" onSubmit={handleAdd}>
        <select
          className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:outline-none w-full md:w-1/4"
          value={selectedUserId}
          onChange={e => setSelectedUserId(e.target.value)}
          required
          disabled={usersLoading}
        >
          <option value="">Select User</option>
          {allUsers.map(u => (
            <option key={u.id} value={u.id}>
              {u.first_name || u.last_name ? `${u.first_name || ''} ${u.last_name || ''}`.trim() : u.email}
              {' '}[{u.email}] ({u.user_type || 'demo'})
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:outline-none w-full md:w-1/4"
          required
        />
        <input
          type="text"
          placeholder="Service Name"
          value={serviceName}
          onChange={e => setServiceName(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:outline-none w-full md:w-1/4"
          required
        />
        <input
          type="text"
          placeholder="API Key"
          value={apiKey}
          onChange={e => setApiKey(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:outline-none w-full md:w-1/4"
          required
        />
        <button type="submit" className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold px-6 py-2 rounded-md shadow transition disabled:opacity-60" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Add'}
        </button>
      </form>
      {isLoading ? (
        <div className="text-center text-gray-500 py-8">Loading credentials...</div>
      ) : error ? (
        <div className="text-red-600 text-center py-8">Error: {error.message}</div>
      ) : credentials.length === 0 ? (
        <div className="text-center text-gray-400 py-8">No API credentials found.</div>
      ) : (
        <div className="space-y-4">
          {credentials.map(cred => {
            const user = allUsers.find(u => u.id === cred.user_id);
            return (
              <div key={cred.id} className="bg-white border border-gray-100 shadow-sm rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex-1">
                  <div className="font-semibold text-lg text-blue-800 flex items-center gap-2">
                    <span className="inline-block bg-blue-50 text-blue-600 rounded px-2 py-0.5 text-base">{cred.service_name}</span>
                    {cred.is_active ? <span className="ml-2 text-green-600 text-xs font-medium">Active</span> : <span className="ml-2 text-gray-400 text-xs font-medium">Inactive</span>}
                  </div>
                  <div className="text-gray-500 text-sm mt-1">
                    Assigned to: <span className="font-semibold">
                      {user
                        ? ((user.first_name || user.last_name)
                            ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                            : user.email)
                        : cred.user_id}
                      {' '}[{user?.email || ''}]
                    </span> <span className="ml-2 text-xs text-gray-400">({user?.user_type || 'demo'})</span>
                  </div>
                  <div className="text-gray-500 text-sm mt-1">
                    Created: {new Date(cred.created_at).toLocaleString()}
                  </div>
                  <div className="text-gray-700 text-sm mt-1">
                    API Key: {editId === cred.id ? (
                      <input
                        type="text"
                        value={editApiKey}
                        onChange={e => setEditApiKey(e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 w-48 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                        disabled={isUpdating}
                      />
                    ) : cred.api_key_encrypted ? cred.api_key_encrypted.slice(0, 8) + '...' : ''}
                  </div>
                </div>
                <div className="flex gap-2 mt-2 md:mt-0">
                  {editId === cred.id ? (
                    <>
                      <button
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded shadow"
                        onClick={() => handleUpdate(cred.id)}
                        disabled={isUpdating}
                      >
                        {isUpdating ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-1 rounded shadow"
                        onClick={() => setEditId(null)}
                        disabled={isUpdating}
                      >Cancel</button>
                    </>
                  ) : (
                    <>
                      <button
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded shadow"
                        onClick={() => handleEdit(cred.id, cred.api_key_encrypted)}
                        disabled={isUpdating}
                      >Edit</button>
                      <button
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded shadow"
                        onClick={() => handleDelete(cred.id)}
                        disabled={isDeleting}
                      >{isDeleting ? 'Deleting...' : 'Delete'}</button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ApiCredentialsTab;
