/**
 * Breach Readiness Snapshot
 * Assess if organization is ready to handle a breach TODAY
 */

export interface BreachReadinessSnapshot {
  overall_status: 'ready' | 'partially-ready' | 'not-ready';
  overall_score: number;
  checklist_items: BreachReadinessItem[];
  critical_gaps: string[];
  strengths: string[];
  next_actions: string[];
}

export interface BreachReadinessItem {
  id: string;
  requirement: string;
  status: 'complete' | 'incomplete' | 'partial';
  importance: 'critical' | 'high' | 'medium';
  ocr_perspective: string;
  evidence_required?: string;
}

/**
 * Assess breach readiness based on current compliance state
 */
export function assessBreachReadiness(params: {
  hasIncidentResponsePlan: boolean;
  hasBreachNotificationTemplates: boolean;
  hasIncidentResponseTeam: boolean;
  hasLogRetention: boolean;
  hasSecurityOfficer: boolean;
  hasPrivacyOfficer: boolean;
  hasBAAs: boolean;
  hasInsurance: boolean;
  lastIncidentDrillDate?: Date | null;
}): BreachReadinessSnapshot {
  const checklistItems: BreachReadinessItem[] = [
    {
      id: 'incident-plan',
      requirement: 'Documented Incident Response Plan',
      status: params.hasIncidentResponsePlan ? 'complete' : 'incomplete',
      importance: 'critical',
      ocr_perspective: 'Without a documented plan, you cannot prove you have procedures to respond to breaches. This is cited in every breach investigation.',
      evidence_required: 'Incident Response Plan document with breach notification timelines'
    },
    {
      id: 'notification-templates',
      requirement: 'Breach Notification Letter Templates',
      status: params.hasBreachNotificationTemplates ? 'complete' : 'incomplete',
      importance: 'critical',
      ocr_perspective: 'You have 60 days to notify affected individuals. Templates ensure you meet deadlines and include required content.',
      evidence_required: 'Pre-drafted templates for patient notification, HHS notification, and media notification'
    },
    {
      id: 'response-team',
      requirement: 'Designated Incident Response Team',
      status: params.hasIncidentResponseTeam ? 'complete' : 'incomplete',
      importance: 'high',
      ocr_perspective: 'Breaches require immediate coordinated response. Having a designated team with roles saves critical time.',
      evidence_required: 'Incident Response Team roster with roles and 24/7 contact information'
    },
    {
      id: 'log-retention',
      requirement: 'Audit Logging & Log Retention',
      status: params.hasLogRetention ? 'complete' : 'incomplete',
      importance: 'critical',
      ocr_perspective: 'In a breach investigation, OCR will request logs. If you don\'t have them, you cannot determine scope or prove containment.',
      evidence_required: 'System audit logs with retention policy (minimum 6 years)'
    },
    {
      id: 'officers-designated',
      requirement: 'Designated Security & Privacy Officers',
      status: (params.hasSecurityOfficer && params.hasPrivacyOfficer) ? 'complete' : 'incomplete',
      importance: 'critical',
      ocr_perspective: 'Officers are responsible for breach response. OCR expects them to be formally designated and trained.',
      evidence_required: 'Written designation letters for both Security and Privacy Officers'
    },
    {
      id: 'vendor-baas',
      requirement: 'Business Associate Agreements (BAAs)',
      status: params.hasBAAs ? 'complete' : 'incomplete',
      importance: 'critical',
      ocr_perspective: 'If a vendor causes a breach, your BAA determines liability and notification timelines. Missing BAAs = you\'re fully liable.',
      evidence_required: 'Executed BAAs with all vendors that handle PHI'
    },
    {
      id: 'cyber-insurance',
      requirement: 'Cyber Liability / Breach Insurance',
      status: params.hasInsurance ? 'complete' : 'incomplete',
      importance: 'high',
      ocr_perspective: 'Not required by HIPAA, but breach costs (notification, credit monitoring, legal) can be devastating without insurance.',
      evidence_required: 'Cyber liability insurance policy covering breach response costs'
    },
    {
      id: 'breach-drill',
      requirement: 'Incident Response Drill/Exercise',
      status: params.lastIncidentDrillDate && 
              (Date.now() - new Date(params.lastIncidentDrillDate).getTime()) < (365 * 24 * 60 * 60 * 1000)
              ? 'complete' 
              : 'incomplete',
      importance: 'medium',
      ocr_perspective: 'Testing your response plan before a real breach ensures your team knows their roles and can meet critical deadlines.',
      evidence_required: 'Documentation of tabletop exercise or breach response drill'
    }
  ];

  // Calculate score
  const criticalComplete = checklistItems.filter(i => i.importance === 'critical' && i.status === 'complete').length;
  const criticalTotal = checklistItems.filter(i => i.importance === 'critical').length;
  const totalComplete = checklistItems.filter(i => i.status === 'complete').length;
  const totalItems = checklistItems.length;

  const score = Math.round((totalComplete / totalItems) * 100);

  // Determine overall status
  let overallStatus: 'ready' | 'partially-ready' | 'not-ready';
  if (criticalComplete === criticalTotal && totalComplete >= totalItems - 1) {
    overallStatus = 'ready';
  } else if (criticalComplete >= criticalTotal - 1) {
    overallStatus = 'partially-ready';
  } else {
    overallStatus = 'not-ready';
  }

  // Identify gaps
  const criticalGaps = checklistItems
    .filter(i => i.importance === 'critical' && i.status !== 'complete')
    .map(i => i.requirement);

  const strengths = checklistItems
    .filter(i => i.status === 'complete')
    .map(i => i.requirement);

  // Next actions
  const nextActions: string[] = [];
  if (criticalGaps.length > 0) {
    nextActions.push('Address all critical gaps immediately - these are essential for breach response');
  }
  if (!params.hasIncidentResponsePlan) {
    nextActions.push('Create and document Incident Response Plan with breach notification procedures');
  }
  if (!params.hasBreachNotificationTemplates) {
    nextActions.push('Draft breach notification letter templates (patient, HHS, media)');
  }
  if (!params.lastIncidentDrillDate) {
    nextActions.push('Conduct tabletop breach response exercise to test your plan');
  }
  if (nextActions.length === 0) {
    nextActions.push('Maintain current readiness with annual reviews and drills');
  }

  return {
    overall_status: overallStatus,
    overall_score: score,
    checklist_items: checklistItems,
    critical_gaps: criticalGaps,
    strengths,
    next_actions: nextActions
  };
}

/**
 * Get status display info
 */
export function getBreachReadinessDisplay(status: 'ready' | 'partially-ready' | 'not-ready') {
  switch (status) {
    case 'ready':
      return {
        label: 'Breach Ready',
        description: 'You have the essential components to respond to a breach',
        color: 'green',
        icon: '✓'
      };
    case 'partially-ready':
      return {
        label: 'Partially Ready',
        description: 'Some gaps exist that could delay or complicate breach response',
        color: 'yellow',
        icon: '⚠'
      };
    case 'not-ready':
      return {
        label: 'Not Ready',
        description: 'Critical gaps exist - a breach today would be very difficult to manage',
        color: 'red',
        icon: '✗'
      };
  }
}
