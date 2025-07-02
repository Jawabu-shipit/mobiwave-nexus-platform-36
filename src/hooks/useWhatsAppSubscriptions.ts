
import { useWhatsAppSubscriptionsData } from './whatsapp/useWhatsAppSubscriptionsData';
import { useWhatsAppSubscriptionMutations } from './whatsapp/useWhatsAppSubscriptionMutations';
import { useWhatsAppTemplatesData } from './whatsapp/useWhatsAppTemplatesData';
import { useWhatsAppTemplateMutations } from './whatsapp/useWhatsAppTemplateMutations';
import { useWhatsAppMessagesData } from './whatsapp/useWhatsAppMessagesData';

export const useWhatsAppSubscriptions = () => {
  const { data: subscriptions = [], isLoading } = useWhatsAppSubscriptionsData();
  const { createSubscription, isCreating } = useWhatsAppSubscriptionMutations();

  return {
    subscriptions,
    isLoading,
    createSubscription,
    isCreating
  };
};

export const useWhatsAppTemplates = (subscriptionId?: string) => {
  const { data: templates = [], isLoading } = useWhatsAppTemplatesData(subscriptionId);
  const { createTemplate, isCreating } = useWhatsAppTemplateMutations(subscriptionId);

  return {
    templates,
    isLoading,
    createTemplate,
    isCreating
  };
};

export const useWhatsAppMessages = (subscriptionId?: string) => {
  const { data: messages = [], isLoading } = useWhatsAppMessagesData(subscriptionId);

  return {
    messages,
    isLoading
  };
};
