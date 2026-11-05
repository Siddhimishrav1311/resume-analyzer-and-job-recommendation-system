"use server";

import { spawn } from "child_process";
import path from "path";

type SuitabilityResult = {
  score: number;
  model: string;
};

export async function calculateSuitability(
  resumeText: string,
  jobDescription: string
): Promise<SuitabilityResult> {
  if (!resumeText?.trim()) {
    throw new Error("Resume text is required.");
  }

  if (!jobDescription?.trim()) {
    throw new Error("Job description is required.");
  }

  const projectRoot = process.cwd();

  const pythonPath = path.join(
    projectRoot,
    "ml",
    ".venv",
    "bin",
    "python"
  );

  const scriptPath = path.join(
    projectRoot,
    "ml",
    "src",
    "predict.py"
  );

  return new Promise((resolve, reject) => {
    const pythonProcess = spawn(
      pythonPath,
      [
        scriptPath,
        resumeText,
        jobDescription,
      ],
      {
        cwd: projectRoot,
      }
    );

    let stdout = "";
    let stderr = "";

    pythonProcess.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    pythonProcess.on("error", (error) => {
      reject(
        new Error(
          `Failed to start ML model: ${error.message}`
        )
      );
    });

    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        reject(
          new Error(
            stderr ||
              `ML prediction failed with exit code ${code}`
          )
        );
        return;
      }

      try {
        const result = JSON.parse(stdout.trim());

        if (result.error) {
          reject(new Error(result.error));
          return;
        }

        if (
          typeof result.score !== "number"
        ) {
          reject(
            new Error(
              "ML model returned an invalid score."
            )
          );
          return;
        }

        resolve({
          score: result.score,
          model:
            result.model ??
            "final_suitability_model",
        });
      } catch {
        reject(
          new Error(
            `Invalid ML output: ${stdout}`
          )
        );
      }
    });
  });
}