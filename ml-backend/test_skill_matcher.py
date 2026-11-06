
from app.services.skill_matcher import extract_skills


resume = """
Mechanical engineering student experienced in Python,
robotics simulation, CAD design, SolidWorks, and
computer-aided design.

Worked with Gazebo, ROS2, autonomous drone simulation,
mechanical design and 3D modelling.
"""

results = extract_skills(resume)

print("\n--- EXTRACTED ESCO SKILLS ---")

for skill in results:
    print(
        f"{skill['label']} | "
        f"{skill['skill_type']} | "
        f"Matched: {skill['matched_label']}"
    )

print(f"\nTotal recognized ESCO skills: {len(results)}")
