# Glossary

This document defines common terms used throughout the Roogo Fitness codebase to ensure a ubiquitous language among developers.

- **`Exercise`**: A specific physical movement (e.g., "Bench Press", "Squat"). 
- **`Muscle`**: A specific muscle group targeted by an exercise (e.g., "Chest", "Triceps").
- **`WorkoutPlan`**: A structured routine consisting of multiple `WorkoutSession` templates (e.g., "Push/Pull/Legs Program").
- **`WorkoutSession`**: A template for a single day's workout within a `WorkoutPlan` (e.g., "Push Day"). It defines which exercises to do, but holds no user performance data.
- **`LoggedSession`**: A historical record of a completed workout. It contains the actual sets, reps, and weights lifted by the user on a specific date.
- **`Set`**: A collection of reps for a specific exercise during a session.
- **`Volume`**: The total weight lifted calculated as `reps * weight` for a given set or session.
