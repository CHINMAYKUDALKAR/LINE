export const stageLabels: Record<string, string> = {
    received: 'Received',
    screening: 'Screening',
    'interview-1': 'Interview 1',
    'interview-2': 'Interview 2',
    'hr-round': 'HR Round',
    offer: 'Offer',
};

export const stageColors: Record<string, string> = {
    received: 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200',
    screening: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
    'interview-1': 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100',
    'interview-2': 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100',
    'hr-round': 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
    offer: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
};

export const getInitials = (name: string) => {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
};
