import { mockExercises, mockMuscles } from './exercise.mock';

const LOWER_BODY_AND_CORE: { muscleId: number; muscleName: string; exerciseIds: number[] }[] = [
  { muscleId: 11, muscleName: 'Quadriceps', exerciseIds: [113, 115, 137, 138] },
  { muscleId: 12, muscleName: 'Hamstrings', exerciseIds: [112, 114, 136] },
  { muscleId: 13, muscleName: 'Gluteus', exerciseIds: [117, 139] },
  { muscleId: 14, muscleName: 'Calves', exerciseIds: [116, 140] },
  { muscleId: 15, muscleName: 'Core', exerciseIds: [105, 124] },
];

describe('mockExercises muscle references', () => {
  const musclesById = new Map(mockMuscles.map((muscle) => [muscle.id, muscle]));

  it('points every muscle id at a muscle with the same name', () => {
    for (const exercise of mockExercises) {
      const primary = exercise.primary_muscle;
      if (!primary) {
        throw new Error(`${exercise.id} ${exercise.name} has no primary muscle`);
      }

      const primaryMuscle = musclesById.get(primary.id);
      expect(primaryMuscle?.name, `${exercise.id} ${exercise.name}`).toBe(primary.name);

      for (const secondary of exercise.secondary_muscles ?? []) {
        const secondaryMuscle = musclesById.get(secondary.id);
        expect(secondaryMuscle?.name, `${exercise.id} ${exercise.name} secondary`).toBe(
          secondary.name,
        );
      }
    }
  });

  it('names muscle 2 Middle Chest and keeps its icon file', () => {
    expect(mockMuscles.find((muscle) => muscle.id === 2)).toEqual({
      id: 2,
      name: 'Middle Chest',
      icon_url: 'assets/images/muscles/middle_chest_mucle.webp',
    });

    for (const muscle of mockMuscles) {
      expect(muscle.name).not.toContain('Midle');
    }

    for (const exercise of mockExercises) {
      expect(exercise.primary_muscle?.name ?? '').not.toContain('Midle');
      for (const secondary of exercise.secondary_muscles ?? []) {
        expect(secondary.name).not.toContain('Midle');
      }
    }
  });

  it('lists the lower-body and core exercises under the home-tile muscle ids', () => {
    for (const group of LOWER_BODY_AND_CORE) {
      const muscle = musclesById.get(group.muscleId);
      expect(muscle?.name).toBe(group.muscleName);

      const exerciseIds = mockExercises
        .filter((exercise) => exercise.primary_muscle?.id === group.muscleId)
        .map((exercise) => exercise.id)
        .sort((left, right) => left - right);

      expect(exerciseIds, group.muscleName).toEqual(group.exerciseIds);
    }
  });
});
