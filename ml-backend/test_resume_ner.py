
from transformers import pipeline

MODEL_NAME = "oksomu/resume-ner"

print("Loading pretrained resume analysis model...")

resume_ner = pipeline(
    "token-classification",
    model=MODEL_NAME,
    aggregation_strategy="simple",
    device=-1,
)

sample_resume = """
Sujal Khokale
Email: sujal@example.com
Location: Maharashtra, India

EDUCATION
Bachelor of Technology in Mechanical Engineering

SKILLS
Python, ROS2, Gazebo, SolidWorks, MATLAB

PROJECTS
Developed an autonomous drone simulation using Gazebo.
Worked on robotics simulation and CAD modelling.

CERTIFICATIONS
Python Programming
"""

print("\nAnalyzing resume...")

results = resume_ner(sample_resume)

print("\n--- RESUME INFORMATION EXTRACTED ---")

for item in results:
    print(
        f"Entity: {item['entity_group']} | "
        f"Value: {item['word']} | "
        f"Confidence: {item['score']:.3f}"
    )

print("\nRESUME NER TEST COMPLETED")
