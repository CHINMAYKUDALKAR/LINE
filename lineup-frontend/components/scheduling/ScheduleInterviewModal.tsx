import { useState, useEffect } from 'react';
import { X, Check, ChevronRight, Users, FileText, Bell, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CandidateSelector } from './CandidateSelector';
import { InterviewDetailsForm } from './InterviewDetailsForm';
import { NotificationsStep } from './NotificationsStep';
import { mockCandidates, mockInterviewers, mockTimeSlots } from '@/lib/scheduling-mock-data';
import { toast } from '@/hooks/use-toast';

interface ScheduleInterviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type Step = 1 | 2 | 3;

const steps = [
  { id: 1 as const, label: 'Select Candidates', icon: Users },
  { id: 2 as const, label: 'Interview Details', icon: FileText },
  { id: 3 as const, label: 'Notifications', icon: Bell },
];

export function ScheduleInterviewModal({ open, onOpenChange, onSuccess }: ScheduleInterviewModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Candidates
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);

  // Step 2: Interview Details
  const [selectedInterviewerIds, setSelectedInterviewerIds] = useState<string[]>([]);
  const [interviewMode, setInterviewMode] = useState<'online' | 'offline' | 'phone'>('online');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState(60);
  const [location, setLocation] = useState('');
  const [meetingLink, setMeetingLink] = useState('');

  // Step 3: Notifications
  const [emailCandidate, setEmailCandidate] = useState(true);
  const [emailInterviewers, setEmailInterviewers] = useState(true);
  const [smsReminder, setSmsReminder] = useState(false);
  const [notes, setNotes] = useState('');

  // Simulate loading on open
  useEffect(() => {
    if (open) {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 800);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setCurrentStep(1);
        setSelectedCandidateIds([]);
        setSelectedInterviewerIds([]);
        setInterviewMode('online');
        setSelectedDate(undefined);
        setSelectedTime('');
        setDuration(60);
        setLocation('');
        setMeetingLink('');
        setEmailCandidate(true);
        setEmailInterviewers(true);
        setSmsReminder(false);
        setNotes('');
      }, 200);
    }
  }, [open]);

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedCandidateIds.length > 0;
      case 2:
        return selectedInterviewerIds.length > 0 && selectedDate && selectedTime;
      case 3:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => (prev + 1) as Step);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const payload = {
      tenantId: 'tenant-1',
      candidateIds: selectedCandidateIds,
      interviewerIds: selectedInterviewerIds,
      interviewMode,
      date: selectedDate?.toISOString(),
      startTime: selectedTime,
      duration,
      location: interviewMode === 'offline' ? location : undefined,
      meetingLink: interviewMode === 'online' ? meetingLink : undefined,
      notifications: {
        emailCandidate,
        emailInterviewers,
        smsReminder,
      },
      notes,
    };

    console.log('Submitting interview:', payload);

    setIsSubmitting(false);
    toast({
      title: 'Interview Scheduled',
      description: `Successfully scheduled ${selectedCandidateIds.length} interview(s)`,
    });
    onOpenChange(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-4xl h-[85vh] max-h-[720px] p-0 gap-0 overflow-hidden bg-background [&>button:last-child]:hidden"
        aria-describedby={undefined}
      >
        <DialogTitle className="sr-only">Schedule Interview</DialogTitle>

        <div className="flex h-full min-h-0">
          {/* Sidebar Stepper */}
          <div className="w-56 flex-shrink-0 bg-muted/30 border-r border-border p-6 flex flex-col">
            <h2 className="text-lg font-semibold text-foreground mb-1">Schedule Interview</h2>
            <p className="text-xs text-muted-foreground mb-8">Set up a new interview session</p>

            <nav className="flex-1 space-y-2" aria-label="Progress">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;

                return (
                  <div key={step.id} className="relative">
                    <button
                      onClick={() => isCompleted && setCurrentStep(step.id)}
                      disabled={!isCompleted && !isActive}
                      className={cn(
                        'w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all',
                        'focus:outline-none focus:ring-2 focus:ring-primary/20',
                        isActive && 'bg-primary/10 border border-primary/30',
                        isCompleted && 'hover:bg-accent cursor-pointer',
                        !isActive && !isCompleted && 'opacity-50'
                      )}
                    >
                      <div
                        className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors',
                          isActive && 'bg-primary text-primary-foreground',
                          isCompleted && 'bg-primary/20 text-primary',
                          !isActive && !isCompleted && 'bg-secondary text-muted-foreground'
                        )}
                      >
                        {isCompleted ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Icon className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          'text-sm font-medium truncate',
                          isActive ? 'text-primary' : 'text-foreground'
                        )}>
                          {step.label}
                        </p>
                        <p className="text-xs text-muted-foreground">Step {step.id}</p>
                      </div>
                    </button>

                    {/* Connector line */}
                    {index < steps.length - 1 && (
                      <div className="absolute left-[1.625rem] top-[3.25rem] w-0.5 h-4 bg-border" />
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Quick help */}
            <div className="pt-6 border-t border-border mt-auto">
              <p className="text-xs text-muted-foreground">
                Need help? Press <kbd className="px-1.5 py-0.5 bg-secondary rounded text-[10px] font-mono">?</kbd> for shortcuts
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-w-0 min-h-0">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  {steps.find((s) => s.id === currentStep)?.label}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {currentStep === 1 && 'Choose one or more candidates for this interview'}
                  {currentStep === 2 && 'Configure interview details and timing'}
                  {currentStep === 3 && 'Set up notifications and add notes'}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Step Content */}
            <div className={cn(
              "flex-1 p-6 relative min-h-0",
              currentStep === 1 ? "overflow-hidden flex flex-col" : "overflow-y-auto"
            )}>
              {currentStep === 1 && (
                <CandidateSelector
                  candidates={mockCandidates}
                  selectedIds={selectedCandidateIds}
                  onSelectionChange={setSelectedCandidateIds}
                  isLoading={isLoading}
                />
              )}

              {currentStep === 2 && (
                <InterviewDetailsForm
                  interviewers={mockInterviewers}
                  timeSlots={mockTimeSlots}
                  selectedInterviewerIds={selectedInterviewerIds}
                  onInterviewerChange={setSelectedInterviewerIds}
                  interviewMode={interviewMode}
                  onModeChange={setInterviewMode}
                  selectedDate={selectedDate}
                  onDateChange={setSelectedDate}
                  selectedTime={selectedTime}
                  onTimeChange={setSelectedTime}
                  duration={duration}
                  onDurationChange={setDuration}
                  location={location}
                  onLocationChange={setLocation}
                  meetingLink={meetingLink}
                  onMeetingLinkChange={setMeetingLink}
                  isLoading={isLoading}
                />
              )}

              {currentStep === 3 && (
                <NotificationsStep
                  emailCandidate={emailCandidate}
                  onEmailCandidateChange={setEmailCandidate}
                  emailInterviewers={emailInterviewers}
                  onEmailInterviewersChange={setEmailInterviewers}
                  smsReminder={smsReminder}
                  onSmsReminderChange={setSmsReminder}
                  notes={notes}
                  onNotesChange={setNotes}
                />
              )}
            </div>

            {/* Sticky Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-background flex-shrink-0">
              <div className="flex items-center gap-2">
                {currentStep > 1 && (
                  <Button variant="ghost" onClick={handleBack}>
                    Back
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>

                {currentStep < 3 ? (
                  <Button onClick={handleNext} disabled={!canProceed()} className="gap-2">
                    Continue
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="gap-2 min-w-[140px]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Scheduling...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        Schedule Interview
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
