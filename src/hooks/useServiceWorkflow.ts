
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  required: boolean;
}

interface ServiceCatalog {
  id: string;
  service_name: string;
  service_type: string;
  description: string;
  setup_fee: number;
  monthly_fee: number;
  transaction_fee_type: string;
  transaction_fee_amount: number;
  is_premium: boolean;
  is_active: boolean;
  provider: string;
}

export function useServiceWorkflow() {
  const [selectedService, setSelectedService] = useState<ServiceCatalog | null>(null);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  const initializeWorkflow = useCallback((service: ServiceCatalog) => {
    const baseSteps: WorkflowStep[] = [
      {
        id: 'prerequisite_check',
        title: 'Prerequisite Check',
        description: 'Verify all requirements are met',
        status: 'pending',
        required: true
      },
      {
        id: 'configuration',
        title: 'Service Configuration',
        description: 'Configure service-specific settings',
        status: 'pending',
        required: true
      },
      {
        id: 'validation',
        title: 'Configuration Validation',
        description: 'Validate configuration settings',
        status: 'pending',
        required: true
      },
      {
        id: 'provisioning',
        title: 'Service Provisioning',
        description: 'Provision service with provider',
        status: 'pending',
        required: true
      },
      {
        id: 'testing',
        title: 'Integration Testing',
        description: 'Test service integration',
        status: 'pending',
        required: false
      },
      {
        id: 'activation',
        title: 'Service Activation',
        description: 'Activate service for users',
        status: 'pending',
        required: true
      }
    ];

    // Add service-specific steps
    if (service.service_type === 'ussd') {
      baseSteps.splice(2, 0, {
        id: 'menu_setup',
        title: 'USSD Menu Setup',
        description: 'Configure USSD menu structure',
        status: 'pending',
        required: true
      });
    } else if (service.service_type === 'mpesa') {
      baseSteps.splice(2, 0, {
        id: 'mpesa_setup',
        title: 'M-Pesa Integration Setup',
        description: 'Configure M-Pesa integration parameters',
        status: 'pending',
        required: true
      });
    }

    setWorkflowSteps(baseSteps);
    setCurrentStep(0);
    setSelectedService(service);
  }, []);

  const executeStep = useCallback(async (stepIndex: number) => {
    const step = workflowSteps[stepIndex];
    
    // Update step to in_progress
    setWorkflowSteps(prev => prev.map((s, i) => 
      i === stepIndex ? { ...s, status: 'in_progress' } : s
    ));

    try {
      // Simulate step execution
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mark step as completed
      setWorkflowSteps(prev => prev.map((s, i) => 
        i === stepIndex ? { ...s, status: 'completed' } : s
      ));

      toast.success(`${step.title} completed successfully`);

      // Move to next step
      if (stepIndex < workflowSteps.length - 1) {
        setCurrentStep(stepIndex + 1);
      } else {
        toast.success('Service setup workflow completed successfully');
      }
    } catch (error) {
      // Mark step as failed
      setWorkflowSteps(prev => prev.map((s, i) => 
        i === stepIndex ? { ...s, status: 'failed' } : s
      ));
      toast.error(`${step.title} failed`);
    }
  }, [workflowSteps]);

  const resetWorkflow = useCallback(() => {
    setSelectedService(null);
    setWorkflowSteps([]);
    setCurrentStep(0);
  }, []);

  return {
    selectedService,
    workflowSteps,
    currentStep,
    initializeWorkflow,
    executeStep,
    resetWorkflow
  };
}
