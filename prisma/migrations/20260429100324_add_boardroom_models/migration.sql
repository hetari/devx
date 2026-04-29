-- CreateTable
CREATE TABLE "AgentMemory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agent" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" TEXT,
    "relatedId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AgendaItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agent" TEXT NOT NULL,
    "watchTarget" TEXT NOT NULL,
    "thresholdJson" TEXT NOT NULL,
    "currentValue" REAL,
    "status" TEXT NOT NULL DEFAULT 'ok',
    "lastChecked" DATETIME,
    "enabled" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "BackgroundEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agent" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "payloadJson" TEXT NOT NULL,
    "actionTaken" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AutonomyBudget" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agent" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "dailyCapAmount" REAL,
    "dailyCapCount" INTEGER,
    "monthlyCapAmount" REAL,
    "monthlyCapCount" INTEGER,
    "requiresApprovalAbove" REAL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "approvalRate" REAL
);

-- CreateTable
CREATE TABLE "BoardroomSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "trigger" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "agentsInvolved" TEXT NOT NULL,
    "stancesJson" TEXT NOT NULL,
    "userDecision" TEXT,
    "overrideText" TEXT,
    "outcomeSummary" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Briefing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kind" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "itemsJson" TEXT NOT NULL,
    "pdfPath" TEXT,
    "readAt" DATETIME
);

-- CreateIndex
CREATE INDEX "AgentMemory_agent_type_idx" ON "AgentMemory"("agent", "type");

-- CreateIndex
CREATE INDEX "AgentMemory_createdAt_idx" ON "AgentMemory"("createdAt");

-- CreateIndex
CREATE INDEX "AgendaItem_agent_idx" ON "AgendaItem"("agent");

-- CreateIndex
CREATE INDEX "BackgroundEvent_status_createdAt_idx" ON "BackgroundEvent"("status", "createdAt");

-- CreateIndex
CREATE INDEX "BackgroundEvent_agent_idx" ON "BackgroundEvent"("agent");

-- CreateIndex
CREATE UNIQUE INDEX "AutonomyBudget_agent_actionType_key" ON "AutonomyBudget"("agent", "actionType");

-- CreateIndex
CREATE INDEX "BoardroomSession_createdAt_idx" ON "BoardroomSession"("createdAt");

-- CreateIndex
CREATE INDEX "Briefing_kind_date_idx" ON "Briefing"("kind", "date");
