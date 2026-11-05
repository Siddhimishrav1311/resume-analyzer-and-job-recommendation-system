"use server";

import { spawn } from "child_process";
import path from "path";

type RoleSuitability = {
  id: string;
  title: string;
  score: number;
};

type RoleSuitabilityResult = {
  results: RoleSuitability[];
  model: string;
};

export async function calculateRoleSuitability(
  resumeText: string
): Promise<RoleSuitabilityResult> {
  if (!resumeText?.trim()) {
    throw new Error("Resume text is required.");
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
    "predict_roles.py"
  );

  return new Promise((resolve, reject) => {
    const pythonProcess = spawn(
      pythonPath,
      [scriptPath, resumeText],
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

        if (!Array.isArray(result.results)) {
          reject(
            new Error(
              "ML model returned invalid role results."
            )
          );
          return;
        }

        resolve({
          results: result.results,
          model:
            result.model ||
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