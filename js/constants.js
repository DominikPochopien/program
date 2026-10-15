export const STATUS = { PLANNED: 'planned', PRESENT: 'present', ABSENT: 'absent', CANCELLED: 'cancelled' };
export const STATUS_ICON = { planned: '', present: '✓ ', absent: '✗ ', cancelled: '⊘ ' };
export const STATUS_OPTIONS = [
  { status: STATUS.PRESENT, label: '✓ Byłam na zajęciach' },
  { status: STATUS.ABSENT, label: '✗ Nie byłam na zajęciach' },
  { status: STATUS.CANCELLED, label: '⊘ Zajęcia odwołane' },
];

export const SUBJECT_COLORS = ['#4f46e5', '#e11d74', '#0ea5a4', '#f59e0b', '#16a34a', '#9333ea', '#ef4444', '#0284c7'];
export const QUICK_START_TIMES = ['08:00', '09:45', '10:30', '12:15', '14:00', '15:45', '17:30'];
export const DEFAULT_DURATION_MIN = 90;

export const WEEKDAYS = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'];
// Numery dni w JavaScript (0 = niedziela), w tej samej kolejności co WEEKDAYS.
export const WEEKDAY_JS_INDEXES = [1, 2, 3, 4, 5, 6, 0];
export const DEFAULT_VISIBLE_DAYS = WEEKDAY_JS_INDEXES;

export const GOOD_ATTENDANCE = 80;
export const MIN_ATTENDANCE = 50;

export const MAX_SUBJECT_NAME_LENGTH = 150;
export const MOBILE_NAME_LIMIT = 50;
export const MOBILE_MAX_WIDTH_PX = 820;