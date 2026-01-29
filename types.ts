
export enum CategoryType {
  STORY = 'STORY',
  BOOK = 'BOOK',
  EXAMPLE = 'EXAMPLE',
  MOVEMENT = 'MOVEMENT'
}

export interface WeeklyAnalysis {
  week: string;
  date: string;
  topic: string;
  presenter: string;
  lesson: string;
  feedback: string;
  spread: string;
}

export interface MovementArticle {
  name: string;
  introduction: string;
  detailedContent: string;
  significance: string;
}

export interface ContentData {
  title: string;
  summary: string;
  content: string;
  imagePrompt: string;
  authorOrTarget?: string;
  lessons?: string[];
}

export interface MovementData {
  name: string;
  description: string;
  activities: string[];
  impact: string;
}
