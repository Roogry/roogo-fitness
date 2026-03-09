import { Muscle, Exercise, LoggedSession, WorkoutPlan } from '../types/workout.types';

export const mockMuscles: Muscle[] = [
  { id: 1, name: 'Upper Chest' },
  { id: 2, name: 'Midle Chest' },
  { id: 3, name: 'Lower Chest' },
  { id: 4, name: 'Front Delt' },
  { id: 5, name: 'Side Delt' },
  { id: 6, name: 'Back Delt' },
  { id: 7, name: 'Triceps' },
  { id: 8, name: 'Biceps' },
  { id: 9, name: 'Lats' },
  { id: 10, name: 'Traps' },
  { id: 11, name: 'Upper Back' },
  { id: 12, name: 'Quadriceps' },
  { id: 13, name: 'Hamstrings' },
  { id: 14, name: 'Gluteus' },
  { id: 15, name: 'Calves' },
  { id: 16, name: 'Core' },
];

export const mockExercises: Exercise[] = [
  {
    "id": 100,
    "name": "Wide-Grip Pull-Up",
    "short_description": "1.5x shoulder width overhand grip. Slow 2-3 second negative. Feel your lats pulling apart on the way down. Slight 0.5-1 second pause at the bottom, then lift your chest up and drive your elbows down as you lift yourself up. Don't be afraid to use assistance. Add weight if needed. Keep the form tight and controlled! Once you hit the Last Set RPE on the final set, switch to partial reps. These should be the bottom half of the ROM. Stop once you have 0-1 half reps left in the tank.",
    "primary_muscle": {
      "id": 9,
      "name": "Lats"
    },
    "recommended_warmup_sets": 3,
    "recommended_working_sets": 3,
    "recommended_rest_time_sec": 180,
    "media": []
  },
  {
    "id": 101,
    "name": "Chest-Supported Machine Row",
    "short_description": "Set the chest pad up so you get a deep stretch on each rep. Once you hit the Last Set RPE on the final set, switch to partial reps. These should be the bottom half of the ROM. Stop once you have 0-1 half reps left in the tank.",
    "primary_muscle": {
      "id": 9,
      "name": "Lats"
    },
    "recommended_warmup_sets": 2,
    "recommended_working_sets": 3,
    "recommended_rest_time_sec": 180,
    "media": []
  },
  {
    "id": 102,
    "name": "Half-Kneeling 1-Arm Lat Pulldown",
    "short_description": "Try to keep the cable and your wrist aligned in a straight line throughout the pull. Feel a nice, deep lat stretch at the top. On all sets, alternate full-ROM reps and half-ROM reps (i.e. do 1 rep with full-ROM, then 1 rep half-ROM (in the stretched/top half), then 1 rep full-ROM, then 1 rep half-ROM). Repeat until you've reached the target reps (partial reps count towards the rep count).",
    "primary_muscle": {
      "id": 9,
      "name": "Lats"
    },
    "recommended_warmup_sets": 1,
    "recommended_working_sets": 2,
    "recommended_rest_time_sec": 120,
    "media": []
  },
  {
    "id": 103,
    "name": "Cable 1-Arm Face Pull",
    "short_description": "Pull the cable towards eye-level, with a slight pause at the bottom of each rep (when your arm is bent).",
    "primary_muscle": {
      "id": 6,
      "name": "Back Delt"
    },
    "recommended_warmup_sets": 1,
    "recommended_working_sets": 3,
    "recommended_rest_time_sec": 120,
    "media": []
  },
  {
    "id": 104,
    "name": "Seated Super-Bayesian High Cable Curl",
    "short_description": "Set up the cable at hand height and feel a deep stretch on each rep. Curl until the handle reaches the bench.",
    "primary_muscle": {
      "id": 8,
      "name": "Biceps"
    },
    "recommended_warmup_sets": 1,
    "recommended_working_sets": 3,
    "recommended_rest_time_sec": 120,
    "media": []
  },
  {
    "id": 105,
    "name": "Cable Crunch",
    "short_description": "Round your lower back as you crunch. Maintain a mind-muscle connection with your 6-pack.",
    "primary_muscle": {
      "id": 16,
      "name": "Core"
    },
    "recommended_warmup_sets": 1,
    "recommended_working_sets": 2,
    "recommended_rest_time_sec": 120,
    "media": []
  },
  {
    "id": 106,
    "name": "Meadows Incline DB Lateral Raise",
    "short_description": "Lie down on your side on a ~30° bench. Start with the DB in front of you, raise the DB to parallel to the floor and lower the DB behind you, feeling a deep stretch in your delts, then reverse this motion (2 reps have now been completed). No pausing between reps.",
    "primary_muscle": {
      "id": 5,
      "name": "Side Delt"
    },
    "recommended_warmup_sets": 1,
    "recommended_working_sets": 3,
    "recommended_rest_time_sec": 120,
    "media": []
  },
  {
    "id": 107,
    "name": "Flat Machine Chest Press",
    "short_description": "1 second pause on the chest while maintaining tension on the chest. Once you hit the Last Set RPE on the final set, switch to partial reps. These should be the bottom half of the ROM. Stop once you have 0-1 half reps left in the tank.",
    "primary_muscle": {
      "id": 2,
      "name": "Midle Chest"
    },
    "recommended_warmup_sets": 3,
    "recommended_working_sets": 3,
    "recommended_rest_time_sec": 300,
    "media": []
  },
  {
    "id": 108,
    "name": "Bottom-Half Seated Cable Flye",
    "short_description": "All reps and sets are to be performed in the bottom half of the ROM. Focus on feeling a deep stretch in your pecs at the bottom of each rep.",
    "primary_muscle": {
      "id": 2,
      "name": "Midle Chest"
    },
    "recommended_warmup_sets": 2,
    "recommended_working_sets": 2,
    "recommended_rest_time_sec": 180,
    "media": []
  },
  {
    "id": 109,
    "name": "DB Shoulder Press",
    "short_description": "Bring your hands down to shoulder height on each rep, maintaining tension on the shoulders.",
    "primary_muscle": {
      "id": 4,
      "name": "Front Delt"
    },
    "recommended_warmup_sets": 2,
    "recommended_working_sets": 3,
    "recommended_rest_time_sec": 180,
    "media": []
  },
  {
    "id": 110,
    "name": "Overhead Cable Triceps Extension (Bar)",
    "short_description": "Feel a nasty stretch on the triceps throughout the entire negative. Pause for 1 second in the stretch part of each rep. Immediately after the final set, drop the weight by ~25% and go to failure again.",
    "primary_muscle": {
      "id": 7,
      "name": "Triceps"
    },
    "recommended_warmup_sets": 1,
    "recommended_working_sets": 2,
    "recommended_rest_time_sec": 120,
    "media": []
  },
  {
    "id": 111,
    "name": "Cable Triceps Kickback",
    "short_description": "There are two ways you can do this: upright or bent over. Choose the one that feels more comfortable for you. The main thing is that when you're in the full squeeze, your shoulder should be positioned back behind your torso.",
    "primary_muscle": {
      "id": 7,
      "name": "Triceps"
    },
    "recommended_warmup_sets": 1,
    "recommended_working_sets": 2,
    "recommended_rest_time_sec": 120,
    "media": []
  },
  {
    "id": 112,
    "name": "Seated Leg Curl",
    "short_description": "Lean forward over the machine to get a maximum stretch in your hamstrings. Once you hit failure on the final set, continue with lengthened partials in the top half of the ROM, until you can no longer achieve a full half rep.",
    "primary_muscle": {
      "id": 13,
      "name": "Hamstrings"
    },
    "recommended_warmup_sets": 2,
    "recommended_working_sets": 3,
    "recommended_rest_time_sec": 120,
    "media": []
  },
  {
    "id": 113,
    "name": "Bottom-Half Smith Machine Squat",
    "short_description": "All reps and sets are to be performed in the bottom half of the ROM. Once you are under the bar, set up your feet as you would a normal squat and then bring them forward ~3-6 inches. This will cause you to lean back into the bar slightly, allowing for a more upright squat, while also placing more tension on the quads. If your heels are raising at the bottom, you may need to bring your feet more forward. If your feet feel like they are slipping or your lower back is rounding at the bottom, try bringing your feet ba...",
    "primary_muscle": {
      "id": 12,
      "name": "Quadriceps"
    },
    "recommended_warmup_sets": 4,
    "recommended_working_sets": 3,
    "recommended_rest_time_sec": 300,
    "media": []
  },
  {
    "id": 114,
    "name": "Glute-Ham Raise",
    "short_description": "Cut out the top ~25% of the ROM, where there will be minimal tension on the hamstrings. Squeeze your hamstrings to pull yourself up!",
    "primary_muscle": {
      "id": 13,
      "name": "Hamstrings"
    },
    "recommended_warmup_sets": 2,
    "recommended_working_sets": 3,
    "recommended_rest_time_sec": 180,
    "media": []
  },
  {
    "id": 115,
    "name": "Leg Extension",
    "short_description": "Set the seat back as far as it will go while still feeling comfortable. Grab the handles as hard as you can to pull your butt down into the seat. Use a 2-3 second negative. Feel your quads pulling apart on the negative. Once you hit failure on the final set, continue with lengthened partials in the bottom half of the ROM, until you can no longer achieve a full half rep.",
    "primary_muscle": {
      "id": 12,
      "name": "Quadriceps"
    },
    "recommended_warmup_sets": 2,
    "recommended_working_sets": 3,
    "recommended_rest_time_sec": 120,
    "media": []
  },
  {
    "id": 116,
    "name": "Standing Calf Raise",
    "short_description": "1-2 second pause at the bottom of each rep. Instead of just going up onto your toes, think about rolling your ankle back and forth on the balls of your feet. For the weighted static hold, after the final rep of the final set, rather than reracking the weight immediately, pause at the very bottom of the ROM (with full tension still on the calves) and maintain this hold for 30 seconds.",
    "primary_muscle": {
      "id": 15,
      "name": "Calves"
    },
    "recommended_warmup_sets": 1,
    "recommended_working_sets": 3,
    "recommended_rest_time_sec": 120,
    "media": []
  },
  {
    "id": 117,
    "name": "Machine Hip Abduction",
    "short_description": "If possible, use pads to increase the range of motion on the machine. Lean forward and grab onto the machine rails to stretch the glutes further.",
    "primary_muscle": {
      "id": 14,
      "name": "Gluteus"
    },
    "recommended_warmup_sets": 2,
    "recommended_working_sets": 3,
    "recommended_rest_time_sec": 120,
    "media": []
  },
  {
    "id": 118,
    "name": "DB Wrist Curl (Flexion)",
    "short_description": "Decide on your weak point using The Weak Point Table in your Hypertrophy Handbook. Perform ONE of the exercises listed under Exercise 1 for the sets and reps provided here.",
    "primary_muscle": {
      "id": 8,
      "name": "Biceps"
    },
    "recommended_warmup_sets": 3,
    "recommended_working_sets": 3,
    "recommended_rest_time_sec": 180,
    "media": []
  },
  {
    "id": 119,
    "name": "DB Wrist Curl (Extension)",
    "short_description": "If your weak point is feeling recovered (not sore or fatigued) then feel free to hit Exercise 2. If your weak point is feeling tired or sore, do not perform the second weak point exercise this week.",
    "primary_muscle": {
      "id": 8,
      "name": "Biceps"
    },
    "recommended_warmup_sets": 3,
    "recommended_working_sets": 3,
    "recommended_rest_time_sec": 180,
    "media": []
  },
  {
    "id": 120,
    "name": "EZ-Bar Cable Curl",
    "short_description": "Set up the cable at the lowest position. Maintain constant tension on the biceps. Slow, controlled reps!",
    "primary_muscle": {
      "id": 8,
      "name": "Biceps"
    },
    "recommended_warmup_sets": 1,
    "recommended_working_sets": 3,
    "recommended_rest_time_sec": 120,
    "media": []
  },
  {
    "id": 121,
    "name": "EZ-Bar Skull Crusher",
    "short_description": "Feel a nasty stretch on the triceps throughout the entire negative. Pause for 1 second in the stretch part of each rep.",
    "primary_muscle": {
      "id": 7,
      "name": "Triceps"
    },
    "recommended_warmup_sets": 1,
    "recommended_working_sets": 3,
    "recommended_rest_time_sec": 120,
    "media": []
  },
  {
    "id": 122,
    "name": "Bottom-Half Incline DB Curl",
    "short_description": "All reps and sets are to be performed in the bottom half of the ROM. Keep your upper back planted against the bench. Go light on these and focus on feeling your biceps pull and squeeze.",
    "primary_muscle": {
      "id": 8,
      "name": "Biceps"
    },
    "recommended_warmup_sets": 1,
    "recommended_working_sets": 2,
    "recommended_rest_time_sec": 120,
    "media": []
  },
  {
    "id": 123,
    "name": "Triceps Pressdown (Bar)",
    "short_description": "Focus on squeezing your triceps to move the weight",
    "primary_muscle": {
      "id": 2,
      "name": "Midle Chest"
    },
    "recommended_warmup_sets": 1,
    "recommended_working_sets": 2,
    "recommended_rest_time_sec": 120,
    "media": []
  },
  {
    "id": 124,
    "name": "Roman Chair Leg Raise",
    "short_description": "Allow your lower back to round as you curl your legs up. 10-20 reps is a broad range on purpose: just go until you hit RPE 9-10 (0-1 reps shy of failure) with controlled form.",
    "primary_muscle": {
      "id": 16,
      "name": "Core"
    },
    "recommended_warmup_sets": 1,
    "recommended_working_sets": 3,
    "recommended_rest_time_sec": 120,
    "media": []
  },
  {
    "id": 125,
    "name": "Smith Machine Deficit Row",
    "short_description": "Focus on getting a big stretch and touch your stomach/chest on each rep! Once you hit the Last Set RPE on the final set, switch to partial reps. These should be the bottom half of the ROM. Stop once you have 0-1 half reps left in the tank.",
    "primary_muscle": {
      "id": 9,
      "name": "Lats"
    },
    "recommended_warmup_sets": 3,
    "recommended_working_sets": 3,
    "recommended_rest_time_sec": 240,
    "media": []
  },
  {
    "id": 126,
    "name": "Neutral-Grip Lat Pulldown",
    "short_description": "Do these pulldowns with the handle more out in front of you, more like a cross between pullover and a pulldown. Focus on feeling your lats working more than the weight you're using. On all sets, alternate full-ROM reps and half-ROM reps (i.e. do 1 rep with full-ROM, then 1 rep half-ROM (in the stretched/top half), then 1 rep full-ROM, then 1 rep half-ROM). Repeat until you've reached the target reps (partial reps count towards the rep count).",
    "primary_muscle": {
      "id": 9,
      "name": "Lats"
    },
    "recommended_warmup_sets": 2,
    "recommended_working_sets": 3,
    "recommended_rest_time_sec": 180,
    "media": []
  },
  {
    "id": 127,
    "name": "Moto Cable Row",
    "short_description": "Try to keep your forearm in line with the cable throughout the pull. Smooth, controlled reps.",
    "primary_muscle": {
      "id": 9,
      "name": "Lats"
    },
    "recommended_warmup_sets": 1,
    "recommended_working_sets": 2,
    "recommended_rest_time_sec": 120,
    "media": []
  },
  {
    "id": 128,
    "name": "Bottom-Half EZ-Bar Preacher Curl",
    "short_description": "All reps and sets are to be performed in the bottom half of the ROM. Keep your triceps firmly pinned against the pad as you curl. No pausing at the top or bottom: constant tension on the biceps!",
    "primary_muscle": {
      "id": 8,
      "name": "Biceps"
    },
    "recommended_warmup_sets": 1,
    "recommended_working_sets": 3,
    "recommended_rest_time_sec": 120,
    "media": []
  },
  {
    "id": 129,
    "name": "Super-Stretch Reverse Pec Deck",
    "short_description": "Face side on to the machine and pull your arm across your body to pre-stretch your rear delt. Do reverse flyes 1 arm at a time. Start with your weaker arm.",
    "primary_muscle": {
      "id": 2,
      "name": "Midle Chest"
    },
    "recommended_warmup_sets": 1,
    "recommended_working_sets": 3,
    "recommended_rest_time_sec": 120,
    "media": []
  },
  {
    "id": 130,
    "name": "Machine Cheat Shrug",
    "short_description": "Use controlled momentum and leg drive to shrug the weight up and then CONTROL the negative. Each negative should last 1-2 seconds. Shrug explosively!",
    "primary_muscle": {
      "id": 10,
      "name": "Traps"
    },
    "recommended_warmup_sets": 1,
    "recommended_working_sets": 3,
    "recommended_rest_time_sec": 120,
    "media": []
  },
  {
    "id": 131,
    "name": "High-Cable Cuffed Lateral Raise",
    "short_description": "Focus on squeezing your lateral delt to move the weight. Once you hit failure on the final set, continue with lengthened partials in the bottom half of the ROM, until you can no longer achieve a full half rep.",
    "primary_muscle": {
      "id": 5,
      "name": "Side Delt"
    },
    "recommended_warmup_sets": 1,
    "recommended_working_sets": 3,
    "recommended_rest_time_sec": 120,
    "media": []
  },
  {
    "id": 132,
    "name": "Bottom-Half Low Incline DB Press",
    "short_description": "All reps and sets are to be performed in the bottom half of the ROM. Set the bench at a ~15° incline. 1 second pause on the chest on each rep while maintaining tension on the pecs.",
    "primary_muscle": {
      "id": 2,
      "name": "Midle Chest"
    },
    "recommended_warmup_sets": 3,
    "recommended_working_sets": 3,
    "recommended_rest_time_sec": 180,
    "media": []
  },
  {
    "id": 133,
    "name": "Machine Shoulder Press",
    "short_description": "Keep tension on the shoulders at the bottom.",
    "primary_muscle": {
      "id": 4,
      "name": "Front Delt"
    },
    "recommended_warmup_sets": 3,
    "recommended_working_sets": 3,
    "recommended_rest_time_sec": 180,
    "media": []
  },
  {
    "id": 134,
    "name": "Katana Triceps Extension",
    "short_description": "Flare your elbows out at about 45° and keep your elbows locked in place as you complete the extensions. Once you hit failure on the final set, continue with lengthened partials in the bottom half of the ROM, until you can no longer achieve a full half rep.",
    "primary_muscle": {
      "id": 7,
      "name": "Triceps"
    },
    "recommended_warmup_sets": 1,
    "recommended_working_sets": 3,
    "recommended_rest_time_sec": 120,
    "media": []
  },
  {
    "id": 135,
    "name": "Cable Crossover Ladder",
    "short_description": "Do one set with low cable position, one set with medium-height cable position, and one height with a high cable position.",
    "primary_muscle": {
      "id": 1,
      "name": "Upper Chest"
    },
    "recommended_warmup_sets": 1,
    "recommended_working_sets": 3,
    "recommended_rest_time_sec": 120,
    "media": []
  },
  {
    "id": 136,
    "name": "Barbell RDL",
    "short_description": "The RPE is intentionally low here because these will cause a lot of muscle damage. Don't be tempted to go too heavy. To keep tension on the hamstrings, stop about 75% of the way to full lockout on each rep (i.e. stay in the bottom 3/4 of the range of motion).",
    "primary_muscle": {
      "id": 13,
      "name": "Hamstrings"
    },
    "recommended_warmup_sets": 3,
    "recommended_working_sets": 3,
    "recommended_rest_time_sec": 300,
    "media": []
  },
  {
    "id": 137,
    "name": "Super-ROM Leg Press",
    "short_description": "Feet lower on the platform for more quad focus. Get as deep as you can without excessive back rounding. Control the negative and do a slight pause at the bottom of each rep.",
    "primary_muscle": {
      "id": 2,
      "name": "Midle Chest"
    },
    "recommended_warmup_sets": 4,
    "recommended_working_sets": 3,
    "recommended_rest_time_sec": 300,
    "media": []
  },
  {
    "id": 138,
    "name": "Smith Machine Reverse Lunge",
    "short_description": "Minimize contribution from the back leg. Mind-muscle connection with your glutes here! After the final set for each leg, perform a quad static stretch for that leg for 30 seconds.",
    "primary_muscle": {
      "id": 12,
      "name": "Quadriceps"
    },
    "recommended_warmup_sets": 3,
    "recommended_working_sets": 2,
    "recommended_rest_time_sec": 180,
    "media": []
  },
  {
    "id": 139,
    "name": "Weighted 45° Hyperextension",
    "short_description": "Squeeze your glutes hard at the top of each rep. Slow controlled reps on the way down, followed by an explosive positive.",
    "primary_muscle": {
      "id": 14,
      "name": "Gluteus"
    },
    "recommended_warmup_sets": 1,
    "recommended_working_sets": 2,
    "recommended_rest_time_sec": 120,
    "media": []
  },
  {
    "id": 140,
    "name": "Bottom-Half Standing Calf Raise",
    "short_description": "All reps and sets are to be performed in the bottom half of the ROM. 1-2 second pause at the bottom of each rep. Instead of just going up onto your toes, think about rolling your ankle back and forth on the balls of your feet.",
    "primary_muscle": {
      "id": 15,
      "name": "Calves"
    },
    "recommended_warmup_sets": 1,
    "recommended_working_sets": 3,
    "recommended_rest_time_sec": 120,
    "media": []
  }
];

export const mockWorkoutPlans: WorkoutPlan[] = [
  {
  "id": 1,
  "title": "Push Pull Legs (PPL)",
  "description": "A 4 days/week PPL routine focusing on hypertrophy.",
  "days": 4,
  "isDefault": true,
  "isActive": true,
  "sessions": [
    {
      "id": 5000,
      "title": "Pull #1",
      "session_order": 0,
      "exercises": [
        {
          "id": 10000,
          "exercise_order": 0,
          "target_sets": 3,
          "target_reps": 10,
          "target_rest_time": 180,
          "exercise": {
            "id": 100,
            "name": "Wide-Grip Pull-Up",
            "short_description": "1.5x shoulder width overhand grip. Slow 2-3 second negative. Feel your lats pulling apart on the way down. Slight 0.5-1 second pause at the bottom, then lift your chest up and drive your elbows down as you lift yourself up. Don't be afraid to use assistance. Add weight if needed. Keep the form tight and controlled! Once you hit the Last Set RPE on the final set, switch to partial reps. These should be the bottom half of the ROM. Stop once you have 0-1 half reps left in the tank.",
            "primary_muscle": {
              "id": 9,
              "name": "Lats"
            },
            "recommended_warmup_sets": 3,
            "recommended_working_sets": 3,
            "recommended_rest_time_sec": 180,
            "media": []
          }
        },
        {
          "id": 10001,
          "exercise_order": 1,
          "target_sets": 3,
          "target_reps": 10,
          "target_rest_time": 180,
          "exercise": {
            "id": 101,
            "name": "Chest-Supported Machine Row",
            "short_description": "Set the chest pad up so you get a deep stretch on each rep. Once you hit the Last Set RPE on the final set, switch to partial reps. These should be the bottom half of the ROM. Stop once you have 0-1 half reps left in the tank.",
            "primary_muscle": {
              "id": 9,
              "name": "Lats"
            },
            "recommended_warmup_sets": 2,
            "recommended_working_sets": 3,
            "recommended_rest_time_sec": 180,
            "media": []
          }
        },
        {
          "id": 10002,
          "exercise_order": 2,
          "target_sets": 2,
          "target_reps": 15,
          "target_rest_time": 120,
          "exercise": {
            "id": 102,
            "name": "Half-Kneeling 1-Arm Lat Pulldown",
            "short_description": "Try to keep the cable and your wrist aligned in a straight line throughout the pull. Feel a nice, deep lat stretch at the top. On all sets, alternate full-ROM reps and half-ROM reps (i.e. do 1 rep with full-ROM, then 1 rep half-ROM (in the stretched/top half), then 1 rep full-ROM, then 1 rep half-ROM). Repeat until you've reached the target reps (partial reps count towards the rep count).",
            "primary_muscle": {
              "id": 9,
              "name": "Lats"
            },
            "recommended_warmup_sets": 1,
            "recommended_working_sets": 2,
            "recommended_rest_time_sec": 120,
            "media": []
          }
        },
        {
          "id": 10003,
          "exercise_order": 3,
          "target_sets": 3,
          "target_reps": 12,
          "target_rest_time": 120,
          "exercise": {
            "id": 103,
            "name": "Cable 1-Arm Face Pull",
            "short_description": "Pull the cable towards eye-level, with a slight pause at the bottom of each rep (when your arm is bent).",
            "primary_muscle": {
              "id": 6,
              "name": "Back Delt"
            },
            "recommended_warmup_sets": 1,
            "recommended_working_sets": 3,
            "recommended_rest_time_sec": 120,
            "media": []
          }
        },
        {
          "id": 10004,
          "exercise_order": 4,
          "target_sets": 3,
          "target_reps": 15,
          "target_rest_time": 120,
          "exercise": {
            "id": 104,
            "name": "Seated Super-Bayesian High Cable Curl",
            "short_description": "Set up the cable at hand height and feel a deep stretch on each rep. Curl until the handle reaches the bench.",
            "primary_muscle": {
              "id": 8,
              "name": "Biceps"
            },
            "recommended_warmup_sets": 1,
            "recommended_working_sets": 3,
            "recommended_rest_time_sec": 120,
            "media": []
          }
        },
        {
          "id": 10005,
          "exercise_order": 5,
          "target_sets": 2,
          "target_reps": 12,
          "target_rest_time": 120,
          "exercise": {
            "id": 105,
            "name": "Cable Crunch",
            "short_description": "Round your lower back as you crunch. Maintain a mind-muscle connection with your 6-pack.",
            "primary_muscle": {
              "id": 16,
              "name": "Core"
            },
            "recommended_warmup_sets": 1,
            "recommended_working_sets": 2,
            "recommended_rest_time_sec": 120,
            "media": []
          }
        }
      ]
    },
    {
      "id": 5001,
      "title": "Push #1",
      "session_order": 1,
      "exercises": [
        {
          "id": 10006,
          "exercise_order": 0,
          "target_sets": 3,
          "target_reps": 12,
          "target_rest_time": 120,
          "exercise": {
            "id": 106,
            "name": "Meadows Incline DB Lateral Raise",
            "short_description": "Lie down on your side on a ~30° bench. Start with the DB in front of you, raise the DB to parallel to the floor and lower the DB behind you, feeling a deep stretch in your delts, then reverse this motion (2 reps have now been completed). No pausing between reps.",
            "primary_muscle": {
              "id": 5,
              "name": "Side Delt"
            },
            "recommended_warmup_sets": 1,
            "recommended_working_sets": 3,
            "recommended_rest_time_sec": 120,
            "media": []
          }
        },
        {
          "id": 10007,
          "exercise_order": 1,
          "target_sets": 3,
          "target_reps": 10,
          "target_rest_time": 300,
          "exercise": {
            "id": 107,
            "name": "Flat Machine Chest Press",
            "short_description": "1 second pause on the chest while maintaining tension on the chest. Once you hit the Last Set RPE on the final set, switch to partial reps. These should be the bottom half of the ROM. Stop once you have 0-1 half reps left in the tank.",
            "primary_muscle": {
              "id": 2,
              "name": "Midle Chest"
            },
            "recommended_warmup_sets": 3,
            "recommended_working_sets": 3,
            "recommended_rest_time_sec": 300,
            "media": []
          }
        },
        {
          "id": 10008,
          "exercise_order": 2,
          "target_sets": 2,
          "target_reps": 10,
          "target_rest_time": 180,
          "exercise": {
            "id": 108,
            "name": "Bottom-Half Seated Cable Flye",
            "short_description": "All reps and sets are to be performed in the bottom half of the ROM. Focus on feeling a deep stretch in your pecs at the bottom of each rep.",
            "primary_muscle": {
              "id": 2,
              "name": "Midle Chest"
            },
            "recommended_warmup_sets": 2,
            "recommended_working_sets": 2,
            "recommended_rest_time_sec": 180,
            "media": []
          }
        },
        {
          "id": 10009,
          "exercise_order": 3,
          "target_sets": 3,
          "target_reps": 12,
          "target_rest_time": 180,
          "exercise": {
            "id": 109,
            "name": "DB Shoulder Press",
            "short_description": "Bring your hands down to shoulder height on each rep, maintaining tension on the shoulders.",
            "primary_muscle": {
              "id": 4,
              "name": "Front Delt"
            },
            "recommended_warmup_sets": 2,
            "recommended_working_sets": 3,
            "recommended_rest_time_sec": 180,
            "media": []
          }
        },
        {
          "id": 10010,
          "exercise_order": 4,
          "target_sets": 2,
          "target_reps": 15,
          "target_rest_time": 120,
          "exercise": {
            "id": 110,
            "name": "Overhead Cable Triceps Extension (Bar)",
            "short_description": "Feel a nasty stretch on the triceps throughout the entire negative. Pause for 1 second in the stretch part of each rep. Immediately after the final set, drop the weight by ~25% and go to failure again.",
            "primary_muscle": {
              "id": 7,
              "name": "Triceps"
            },
            "recommended_warmup_sets": 1,
            "recommended_working_sets": 2,
            "recommended_rest_time_sec": 120,
            "media": []
          }
        },
        {
          "id": 10011,
          "exercise_order": 5,
          "target_sets": 2,
          "target_reps": 20,
          "target_rest_time": 120,
          "exercise": {
            "id": 111,
            "name": "Cable Triceps Kickback",
            "short_description": "There are two ways you can do this: upright or bent over. Choose the one that feels more comfortable for you. The main thing is that when you're in the full squeeze, your shoulder should be positioned back behind your torso.",
            "primary_muscle": {
              "id": 7,
              "name": "Triceps"
            },
            "recommended_warmup_sets": 1,
            "recommended_working_sets": 2,
            "recommended_rest_time_sec": 120,
            "media": []
          }
        }
      ]
    },
    {
      "id": 5002,
      "title": "Legs #1",
      "session_order": 2,
      "exercises": [
        {
          "id": 10012,
          "exercise_order": 0,
          "target_sets": 3,
          "target_reps": 10,
          "target_rest_time": 120,
          "exercise": {
            "id": 112,
            "name": "Seated Leg Curl",
            "short_description": "Lean forward over the machine to get a maximum stretch in your hamstrings. Once you hit failure on the final set, continue with lengthened partials in the top half of the ROM, until you can no longer achieve a full half rep.",
            "primary_muscle": {
              "id": 13,
              "name": "Hamstrings"
            },
            "recommended_warmup_sets": 2,
            "recommended_working_sets": 3,
            "recommended_rest_time_sec": 120,
            "media": []
          }
        },
        {
          "id": 10013,
          "exercise_order": 1,
          "target_sets": 3,
          "target_reps": 8,
          "target_rest_time": 300,
          "exercise": {
            "id": 113,
            "name": "Bottom-Half Smith Machine Squat",
            "short_description": "All reps and sets are to be performed in the bottom half of the ROM. Once you are under the bar, set up your feet as you would a normal squat and then bring them forward ~3-6 inches. This will cause you to lean back into the bar slightly, allowing for a more upright squat, while also placing more tension on the quads. If your heels are raising at the bottom, you may need to bring your feet more forward. If your feet feel like they are slipping or your lower back is rounding at the bottom, try bringing your feet ba...",
            "primary_muscle": {
              "id": 12,
              "name": "Quadriceps"
            },
            "recommended_warmup_sets": 4,
            "recommended_working_sets": 3,
            "recommended_rest_time_sec": 300,
            "media": []
          }
        },
        {
          "id": 10014,
          "exercise_order": 2,
          "target_sets": 3,
          "target_reps": 12,
          "target_rest_time": 180,
          "exercise": {
            "id": 114,
            "name": "Glute-Ham Raise",
            "short_description": "Cut out the top ~25% of the ROM, where there will be minimal tension on the hamstrings. Squeeze your hamstrings to pull yourself up!",
            "primary_muscle": {
              "id": 13,
              "name": "Hamstrings"
            },
            "recommended_warmup_sets": 2,
            "recommended_working_sets": 3,
            "recommended_rest_time_sec": 180,
            "media": []
          }
        },
        {
          "id": 10015,
          "exercise_order": 3,
          "target_sets": 3,
          "target_reps": 12,
          "target_rest_time": 120,
          "exercise": {
            "id": 115,
            "name": "Leg Extension",
            "short_description": "Set the seat back as far as it will go while still feeling comfortable. Grab the handles as hard as you can to pull your butt down into the seat. Use a 2-3 second negative. Feel your quads pulling apart on the negative. Once you hit failure on the final set, continue with lengthened partials in the bottom half of the ROM, until you can no longer achieve a full half rep.",
            "primary_muscle": {
              "id": 12,
              "name": "Quadriceps"
            },
            "recommended_warmup_sets": 2,
            "recommended_working_sets": 3,
            "recommended_rest_time_sec": 120,
            "media": []
          }
        },
        {
          "id": 10016,
          "exercise_order": 4,
          "target_sets": 3,
          "target_reps": 20,
          "target_rest_time": 120,
          "exercise": {
            "id": 116,
            "name": "Standing Calf Raise",
            "short_description": "1-2 second pause at the bottom of each rep. Instead of just going up onto your toes, think about rolling your ankle back and forth on the balls of your feet. For the weighted static hold, after the final rep of the final set, rather than reracking the weight immediately, pause at the very bottom of the ROM (with full tension still on the calves) and maintain this hold for 30 seconds.",
            "primary_muscle": {
              "id": 15,
              "name": "Calves"
            },
            "recommended_warmup_sets": 1,
            "recommended_working_sets": 3,
            "recommended_rest_time_sec": 120,
            "media": []
          }
        },
        {
          "id": 10017,
          "exercise_order": 5,
          "target_sets": 3,
          "target_reps": 15,
          "target_rest_time": 120,
          "exercise": {
            "id": 117,
            "name": "Machine Hip Abduction",
            "short_description": "If possible, use pads to increase the range of motion on the machine. Lean forward and grab onto the machine rails to stretch the glutes further.",
            "primary_muscle": {
              "id": 14,
              "name": "Gluteus"
            },
            "recommended_warmup_sets": 2,
            "recommended_working_sets": 3,
            "recommended_rest_time_sec": 120,
            "media": []
          }
        }
      ]
    },
    {
      "id": 5003,
      "title": "Arms & Weak Points #1",
      "session_order": 3,
      "exercises": [
        {
          "id": 10018,
          "exercise_order": 0,
          "target_sets": 3,
          "target_reps": 12,
          "target_rest_time": 180,
          "exercise": {
            "id": 118,
            "name": "DB Wrist Curl (Flexion)",
            "short_description": "Decide on your weak point using The Weak Point Table in your Hypertrophy Handbook. Perform ONE of the exercises listed under Exercise 1 for the sets and reps provided here.",
            "primary_muscle": {
              "id": 8,
              "name": "Biceps"
            },
            "recommended_warmup_sets": 3,
            "recommended_working_sets": 3,
            "recommended_rest_time_sec": 180,
            "media": []
          }
        },
        {
          "id": 10019,
          "exercise_order": 1,
          "target_sets": 3,
          "target_reps": 12,
          "target_rest_time": 180,
          "exercise": {
            "id": 119,
            "name": "DB Wrist Curl (Extension)",
            "short_description": "If your weak point is feeling recovered (not sore or fatigued) then feel free to hit Exercise 2. If your weak point is feeling tired or sore, do not perform the second weak point exercise this week.",
            "primary_muscle": {
              "id": 8,
              "name": "Biceps"
            },
            "recommended_warmup_sets": 3,
            "recommended_working_sets": 3,
            "recommended_rest_time_sec": 180,
            "media": []
          }
        },
        {
          "id": 10020,
          "exercise_order": 2,
          "target_sets": 3,
          "target_reps": 12,
          "target_rest_time": 120,
          "exercise": {
            "id": 120,
            "name": "EZ-Bar Cable Curl",
            "short_description": "Set up the cable at the lowest position. Maintain constant tension on the biceps. Slow, controlled reps!",
            "primary_muscle": {
              "id": 8,
              "name": "Biceps"
            },
            "recommended_warmup_sets": 1,
            "recommended_working_sets": 3,
            "recommended_rest_time_sec": 120,
            "media": []
          }
        },
        {
          "id": 10021,
          "exercise_order": 3,
          "target_sets": 3,
          "target_reps": 12,
          "target_rest_time": 120,
          "exercise": {
            "id": 121,
            "name": "EZ-Bar Skull Crusher",
            "short_description": "Feel a nasty stretch on the triceps throughout the entire negative. Pause for 1 second in the stretch part of each rep.",
            "primary_muscle": {
              "id": 7,
              "name": "Triceps"
            },
            "recommended_warmup_sets": 1,
            "recommended_working_sets": 3,
            "recommended_rest_time_sec": 120,
            "media": []
          }
        },
        {
          "id": 10022,
          "exercise_order": 4,
          "target_sets": 2,
          "target_reps": 15,
          "target_rest_time": 120,
          "exercise": {
            "id": 122,
            "name": "Bottom-Half Incline DB Curl",
            "short_description": "All reps and sets are to be performed in the bottom half of the ROM. Keep your upper back planted against the bench. Go light on these and focus on feeling your biceps pull and squeeze.",
            "primary_muscle": {
              "id": 8,
              "name": "Biceps"
            },
            "recommended_warmup_sets": 1,
            "recommended_working_sets": 2,
            "recommended_rest_time_sec": 120,
            "media": []
          }
        },
        {
          "id": 10023,
          "exercise_order": 5,
          "target_sets": 2,
          "target_reps": 15,
          "target_rest_time": 120,
          "exercise": {
            "id": 123,
            "name": "Triceps Pressdown (Bar)",
            "short_description": "Focus on squeezing your triceps to move the weight",
            "primary_muscle": {
              "id": 2,
              "name": "Midle Chest"
            },
            "recommended_warmup_sets": 1,
            "recommended_working_sets": 2,
            "recommended_rest_time_sec": 120,
            "media": []
          }
        },
        {
          "id": 10024,
          "exercise_order": 6,
          "target_sets": 3,
          "target_reps": 20,
          "target_rest_time": 120,
          "exercise": {
            "id": 124,
            "name": "Roman Chair Leg Raise",
            "short_description": "Allow your lower back to round as you curl your legs up. 10-20 reps is a broad range on purpose: just go until you hit RPE 9-10 (0-1 reps shy of failure) with controlled form.",
            "primary_muscle": {
              "id": 16,
              "name": "Core"
            },
            "recommended_warmup_sets": 1,
            "recommended_working_sets": 3,
            "recommended_rest_time_sec": 120,
            "media": []
          }
        }
      ]
    },
    {
      "id": 5004,
      "title": "Pull #2",
      "session_order": 4,
      "exercises": [
        {
          "id": 10025,
          "exercise_order": 0,
          "target_sets": 3,
          "target_reps": 10,
          "target_rest_time": 240,
          "exercise": {
            "id": 125,
            "name": "Smith Machine Deficit Row",
            "short_description": "Focus on getting a big stretch and touch your stomach/chest on each rep! Once you hit the Last Set RPE on the final set, switch to partial reps. These should be the bottom half of the ROM. Stop once you have 0-1 half reps left in the tank.",
            "primary_muscle": {
              "id": 9,
              "name": "Lats"
            },
            "recommended_warmup_sets": 3,
            "recommended_working_sets": 3,
            "recommended_rest_time_sec": 240,
            "media": []
          }
        },
        {
          "id": 10026,
          "exercise_order": 1,
          "target_sets": 3,
          "target_reps": 10,
          "target_rest_time": 180,
          "exercise": {
            "id": 126,
            "name": "Neutral-Grip Lat Pulldown",
            "short_description": "Do these pulldowns with the handle more out in front of you, more like a cross between pullover and a pulldown. Focus on feeling your lats working more than the weight you're using. On all sets, alternate full-ROM reps and half-ROM reps (i.e. do 1 rep with full-ROM, then 1 rep half-ROM (in the stretched/top half), then 1 rep full-ROM, then 1 rep half-ROM). Repeat until you've reached the target reps (partial reps count towards the rep count).",
            "primary_muscle": {
              "id": 9,
              "name": "Lats"
            },
            "recommended_warmup_sets": 2,
            "recommended_working_sets": 3,
            "recommended_rest_time_sec": 180,
            "media": []
          }
        },
        {
          "id": 10027,
          "exercise_order": 2,
          "target_sets": 2,
          "target_reps": 12,
          "target_rest_time": 120,
          "exercise": {
            "id": 127,
            "name": "Moto Cable Row",
            "short_description": "Try to keep your forearm in line with the cable throughout the pull. Smooth, controlled reps.",
            "primary_muscle": {
              "id": 9,
              "name": "Lats"
            },
            "recommended_warmup_sets": 1,
            "recommended_working_sets": 2,
            "recommended_rest_time_sec": 120,
            "media": []
          }
        },
        {
          "id": 10028,
          "exercise_order": 3,
          "target_sets": 3,
          "target_reps": 15,
          "target_rest_time": 120,
          "exercise": {
            "id": 128,
            "name": "Bottom-Half EZ-Bar Preacher Curl",
            "short_description": "All reps and sets are to be performed in the bottom half of the ROM. Keep your triceps firmly pinned against the pad as you curl. No pausing at the top or bottom: constant tension on the biceps!",
            "primary_muscle": {
              "id": 8,
              "name": "Biceps"
            },
            "recommended_warmup_sets": 1,
            "recommended_working_sets": 3,
            "recommended_rest_time_sec": 120,
            "media": []
          }
        },
        {
          "id": 10029,
          "exercise_order": 4,
          "target_sets": 3,
          "target_reps": 12,
          "target_rest_time": 120,
          "exercise": {
            "id": 129,
            "name": "Super-Stretch Reverse Pec Deck",
            "short_description": "Face side on to the machine and pull your arm across your body to pre-stretch your rear delt. Do reverse flyes 1 arm at a time. Start with your weaker arm.",
            "primary_muscle": {
              "id": 2,
              "name": "Midle Chest"
            },
            "recommended_warmup_sets": 1,
            "recommended_working_sets": 3,
            "recommended_rest_time_sec": 120,
            "media": []
          }
        },
        {
          "id": 10030,
          "exercise_order": 5,
          "target_sets": 3,
          "target_reps": 12,
          "target_rest_time": 120,
          "exercise": {
            "id": 130,
            "name": "Machine Cheat Shrug",
            "short_description": "Use controlled momentum and leg drive to shrug the weight up and then CONTROL the negative. Each negative should last 1-2 seconds. Shrug explosively!",
            "primary_muscle": {
              "id": 10,
              "name": "Traps"
            },
            "recommended_warmup_sets": 1,
            "recommended_working_sets": 3,
            "recommended_rest_time_sec": 120,
            "media": []
          }
        }
      ]
    },
    {
      "id": 5005,
      "title": "Push #2",
      "session_order": 5,
      "exercises": [
        {
          "id": 10031,
          "exercise_order": 0,
          "target_sets": 3,
          "target_reps": 15,
          "target_rest_time": 120,
          "exercise": {
            "id": 131,
            "name": "High-Cable Cuffed Lateral Raise",
            "short_description": "Focus on squeezing your lateral delt to move the weight. Once you hit failure on the final set, continue with lengthened partials in the bottom half of the ROM, until you can no longer achieve a full half rep.",
            "primary_muscle": {
              "id": 5,
              "name": "Side Delt"
            },
            "recommended_warmup_sets": 1,
            "recommended_working_sets": 3,
            "recommended_rest_time_sec": 120,
            "media": []
          }
        },
        {
          "id": 10032,
          "exercise_order": 1,
          "target_sets": 3,
          "target_reps": 12,
          "target_rest_time": 180,
          "exercise": {
            "id": 132,
            "name": "Bottom-Half Low Incline DB Press",
            "short_description": "All reps and sets are to be performed in the bottom half of the ROM. Set the bench at a ~15° incline. 1 second pause on the chest on each rep while maintaining tension on the pecs.",
            "primary_muscle": {
              "id": 2,
              "name": "Midle Chest"
            },
            "recommended_warmup_sets": 3,
            "recommended_working_sets": 3,
            "recommended_rest_time_sec": 180,
            "media": []
          }
        },
        {
          "id": 10033,
          "exercise_order": 2,
          "target_sets": 3,
          "target_reps": 12,
          "target_rest_time": 180,
          "exercise": {
            "id": 133,
            "name": "Machine Shoulder Press",
            "short_description": "Keep tension on the shoulders at the bottom.",
            "primary_muscle": {
              "id": 4,
              "name": "Front Delt"
            },
            "recommended_warmup_sets": 3,
            "recommended_working_sets": 3,
            "recommended_rest_time_sec": 180,
            "media": []
          }
        },
        {
          "id": 10034,
          "exercise_order": 3,
          "target_sets": 3,
          "target_reps": 12,
          "target_rest_time": 120,
          "exercise": {
            "id": 134,
            "name": "Katana Triceps Extension",
            "short_description": "Flare your elbows out at about 45° and keep your elbows locked in place as you complete the extensions. Once you hit failure on the final set, continue with lengthened partials in the bottom half of the ROM, until you can no longer achieve a full half rep.",
            "primary_muscle": {
              "id": 7,
              "name": "Triceps"
            },
            "recommended_warmup_sets": 1,
            "recommended_working_sets": 3,
            "recommended_rest_time_sec": 120,
            "media": []
          }
        },
        {
          "id": 10035,
          "exercise_order": 4,
          "target_sets": 3,
          "target_reps": 12,
          "target_rest_time": 120,
          "exercise": {
            "id": 135,
            "name": "Cable Crossover Ladder",
            "short_description": "Do one set with low cable position, one set with medium-height cable position, and one height with a high cable position.",
            "primary_muscle": {
              "id": 1,
              "name": "Upper Chest"
            },
            "recommended_warmup_sets": 1,
            "recommended_working_sets": 3,
            "recommended_rest_time_sec": 120,
            "media": []
          }
        }
      ]
    },
    {
      "id": 5006,
      "title": "Legs #2",
      "session_order": 6,
      "exercises": [
        {
          "id": 10036,
          "exercise_order": 0,
          "target_sets": 3,
          "target_reps": 10,
          "target_rest_time": 300,
          "exercise": {
            "id": 136,
            "name": "Barbell RDL",
            "short_description": "The RPE is intentionally low here because these will cause a lot of muscle damage. Don't be tempted to go too heavy. To keep tension on the hamstrings, stop about 75% of the way to full lockout on each rep (i.e. stay in the bottom 3/4 of the range of motion).",
            "primary_muscle": {
              "id": 13,
              "name": "Hamstrings"
            },
            "recommended_warmup_sets": 3,
            "recommended_working_sets": 3,
            "recommended_rest_time_sec": 300,
            "media": []
          }
        },
        {
          "id": 10037,
          "exercise_order": 1,
          "target_sets": 3,
          "target_reps": 10,
          "target_rest_time": 300,
          "exercise": {
            "id": 137,
            "name": "Super-ROM Leg Press",
            "short_description": "Feet lower on the platform for more quad focus. Get as deep as you can without excessive back rounding. Control the negative and do a slight pause at the bottom of each rep.",
            "primary_muscle": {
              "id": 2,
              "name": "Midle Chest"
            },
            "recommended_warmup_sets": 4,
            "recommended_working_sets": 3,
            "recommended_rest_time_sec": 300,
            "media": []
          }
        },
        {
          "id": 10038,
          "exercise_order": 2,
          "target_sets": 2,
          "target_reps": 12,
          "target_rest_time": 180,
          "exercise": {
            "id": 138,
            "name": "Smith Machine Reverse Lunge",
            "short_description": "Minimize contribution from the back leg. Mind-muscle connection with your glutes here! After the final set for each leg, perform a quad static stretch for that leg for 30 seconds.",
            "primary_muscle": {
              "id": 12,
              "name": "Quadriceps"
            },
            "recommended_warmup_sets": 3,
            "recommended_working_sets": 2,
            "recommended_rest_time_sec": 180,
            "media": []
          }
        },
        {
          "id": 10039,
          "exercise_order": 3,
          "target_sets": 2,
          "target_reps": 12,
          "target_rest_time": 120,
          "exercise": {
            "id": 139,
            "name": "Weighted 45° Hyperextension",
            "short_description": "Squeeze your glutes hard at the top of each rep. Slow controlled reps on the way down, followed by an explosive positive.",
            "primary_muscle": {
              "id": 14,
              "name": "Gluteus"
            },
            "recommended_warmup_sets": 1,
            "recommended_working_sets": 2,
            "recommended_rest_time_sec": 120,
            "media": []
          }
        },
        {
          "id": 10040,
          "exercise_order": 4,
          "target_sets": 3,
          "target_reps": 12,
          "target_rest_time": 120,
          "exercise": {
            "id": 140,
            "name": "Bottom-Half Standing Calf Raise",
            "short_description": "All reps and sets are to be performed in the bottom half of the ROM. 1-2 second pause at the bottom of each rep. Instead of just going up onto your toes, think about rolling your ankle back and forth on the balls of your feet.",
            "primary_muscle": {
              "id": 15,
              "name": "Calves"
            },
            "recommended_warmup_sets": 1,
            "recommended_working_sets": 3,
            "recommended_rest_time_sec": 120,
            "media": []
          }
        }
      ]
    }
  ]
}
];

// mockLoggedSessions remain as they are or we can keep some dummy ones
export const mockLoggedSessions: LoggedSession[] = [
  {
    id: 1001,
    user_id: Date.now(),
    session_title: 'Push Day Heavy',
    start_time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    end_time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(),
    total_duration: 45,
    total_weight_lifted: 3740,
    notes: 'Felt really strong on the bench press today. Knee is feeling better on squats.',
    workouts: []
  }
];
