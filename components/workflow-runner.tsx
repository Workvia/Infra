"use client";

import * as React from "react";
import { Play, Pause, CheckCircle, XCircle, Loader2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface WorkflowStep {
  name: string;
  status: "pending" | "running" | "completed" | "failed";
  duration?: number;
  error?: string;
}

interface WorkflowRunnerProps {
  workflowId: string;
  workflowName: string;
  workflowType: string;
  onComplete?: (result: any) => void;
}

export function WorkflowRunner({
  workflowId,
  workflowName,
  workflowType,
  onComplete,
}: WorkflowRunnerProps) {
  const [isRunning, setIsRunning] = React.useState(false);
  const [steps, setSteps] = React.useState<WorkflowStep[]>([]);
  const [currentStep, setCurrentStep] = React.useState(0);
  const [result, setResult] = React.useState<any>(null);

  const getWorkflowSteps = (type: string): WorkflowStep[] => {
    switch (type) {
      case "proposal_generation":
        return [
          { name: "Loading carrier quotes", status: "pending" },
          { name: "Normalizing data", status: "pending" },
          { name: "Generating executive summary", status: "pending" },
          { name: "Creating comparison table", status: "pending" },
          { name: "Rendering proposal document", status: "pending" },
        ];

      case "policy_checking":
        return [
          { name: "Loading policies", status: "pending" },
          { name: "Aligning fields", status: "pending" },
          { name: "Detecting material changes", status: "pending" },
          { name: "Assessing impact", status: "pending" },
          { name: "Generating comparison report", status: "pending" },
        ];

      case "coverage_check":
        return [
          { name: "Loading client documents", status: "pending" },
          { name: "Analyzing coverage", status: "pending" },
          { name: "Identifying gaps", status: "pending" },
          { name: "Generating recommendations", status: "pending" },
        ];

      default:
        return [
          { name: "Initializing", status: "pending" },
          { name: "Processing", status: "pending" },
          { name: "Finalizing", status: "pending" },
        ];
    }
  };

  const runWorkflow = async () => {
    setIsRunning(true);
    const workflowSteps = getWorkflowSteps(workflowType);
    setSteps(workflowSteps);
    setCurrentStep(0);

    // Determine API endpoint based on workflow type
    let endpoint = "";
    let payload: any = {};

    switch (workflowType) {
      case "proposal_generation":
        endpoint = "/api/proposals/generate";
        payload = {
          clientId: workflowId,
          quoteIds: ["quote-1", "quote-2", "quote-3"], // Mock data
          format: "pdf",
        };
        break;

      case "policy_checking":
        endpoint = "/api/policies/compare";
        payload = {
          clientId: workflowId,
          policy1Id: "policy-1",
          policy2Id: "policy-2",
        };
        break;

      default:
        endpoint = "/api/workflows/execute";
        payload = { workflowId, workflowType };
    }

    try {
      // Simulate step-by-step execution
      for (let i = 0; i < workflowSteps.length; i++) {
        setCurrentStep(i);

        // Update step to running
        setSteps((prev) =>
          prev.map((step, idx) =>
            idx === i ? { ...step, status: "running" } : step
          )
        );

        // Simulate step duration
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Update step to completed
        setSteps((prev) =>
          prev.map((step, idx) =>
            idx === i
              ? { ...step, status: "completed", duration: 1.5 }
              : step
          )
        );
      }

      // Call actual API
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      setResult(data);
      onComplete?.(data);
    } catch (error) {
      // Mark current step as failed
      setSteps((prev) =>
        prev.map((step, idx) =>
          idx === currentStep
            ? {
                ...step,
                status: "failed",
                error: error instanceof Error ? error.message : "Unknown error",
              }
            : step
        )
      );
    } finally {
      setIsRunning(false);
    }
  };

  const progress = steps.length > 0
    ? (steps.filter((s) => s.status === "completed").length / steps.length) * 100
    : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{workflowName}</CardTitle>
            <CardDescription>
              {workflowType.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
            </CardDescription>
          </div>

          <Button
            onClick={runWorkflow}
            disabled={isRunning}
            className="gap-2"
          >
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Run Workflow
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isRunning && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progress</span>
              <span className="text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}

        {steps.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Steps</h4>

            {steps.map((step, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-lg border"
              >
                <div className="flex-shrink-0">
                  {step.status === "completed" ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : step.status === "failed" ? (
                    <XCircle className="h-5 w-5 text-red-600" />
                  ) : step.status === "running" ? (
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  ) : (
                    <Clock className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>

                <div className="flex-1">
                  <p className="text-sm font-medium">{step.name}</p>
                  {step.duration && (
                    <p className="text-xs text-muted-foreground">
                      Completed in {step.duration}s
                    </p>
                  )}
                  {step.error && (
                    <p className="text-xs text-red-600">{step.error}</p>
                  )}
                </div>

                <Badge
                  variant={
                    step.status === "completed"
                      ? "default"
                      : step.status === "failed"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {step.status}
                </Badge>
              </div>
            ))}
          </div>
        )}

        {result && result.success && (
          <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950">
            <p className="text-sm text-green-900 dark:text-green-100">
              ✓ Workflow completed successfully!
            </p>
            {result.data?.proposal && (
              <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                Proposal generated: {result.data.proposal}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}