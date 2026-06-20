export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  confidenceScore?: number;
  doubtAnalysis?: string;
  agentName?: string;
}

export interface MemoryItem {
  id: string;
  horizon: 'L1_Sensory' | 'L2_Conversational' | 'L3_Episodic' | 'L4_Relational' | 'L5_Semantic' | 'L6_Procedural' | 'L7_IntentScheduler' | 'L8_Wisdom' | 'L9_LegacyLedger';
  summary: string;
  detailedContent: string;
  category: string;
  timestamp: string;
  tags: string[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  status: 'AUTHORIZED' | 'GATED_PENDING' | 'REJECTED' | 'SYSTEM_LOCK';
  cryptographicHash: string;
  details: string;
}

export interface AgentSpec {
  index: number;
  name: string;
  bandColor: number;
  accentColor: number;
  frameColor: number;
  detailType: 'crossStruts' | 'hexNodes' | 'angularBrackets' | 'woundCoils' | 'crystalFacets' | 'ladderRungs' | 'spiralWraps' | 'thorns' | 'nestedArcs' | 'segmentedPlates';
  stoneAngle: number;
  stoneColor: number;
  roleDescription: string;
  agentInstructions: string;
  tokenPool: number;
  reputationScore: number;
}

export interface TelemetryPoint {
  timeIndex: number;
  timeString: string;
  focusLevel: number; // 0 to 100
  cognitiveLoad: number; // 0 to 100
  momentum: number; // 0 to 100
}
