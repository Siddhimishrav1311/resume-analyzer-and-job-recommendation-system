
import json

from app.services.resume_analyzer import analyze_resume


sample_resume = """
Sujal Khokale
Email: sujal@example.com
Location: Maharashtra, India

EDUCATION
Bachelor of Technology in Mechanical Engineering

TECHNICAL SKILLS
Python, ROS2, Gazebo, SolidWorks, MATLAB,
Blender, Fusion 360, PX4, ArduPilot, MoveIt.

PROJECTS
Developed a drone simulation using Gazebo and PX4.
Worked on robot simulation using ROS2 and MoveIt.
Created mechanical designs using SolidWorks.

EXPERIENCE
Engineering Design Intern.
Designed and developed 3D printed components.
"""

result = analyze_resume(sample_resume)

print(json.dumps(result, indent=2, ensure_ascii=False))
