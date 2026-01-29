# Backend API Required Changes

To support the full CRUD functionality (specifically Edit/Update) in the frontend, the following changes are required in the Kotlin backend (`src/main/kotlin/com/iamalangreen/self/lifting/`).

## 1. Gym Feature (`gym.kt`)

### Controller Change
Add a `PUT` endpoint to `GymController` to allow updating an existing Gym.

```kotlin
@PutMapping("/{id}")
fun updateGym(@PathVariable id: Long, @RequestBody request: CreateGymRequest): Response {
    if (request.name.isBlank() || request.location.isBlank()) {
        throw IllegalRequestArgumentException()
    }
    return success(gymService.updateGym(id, request.name, request.location).toResponse())
}
```

### Service Change
Add `updateGym` to `GymService` and implementation in `DefaultGymService`.

```kotlin
// Interface
fun updateGym(id: Long, name: String, location: String): Gym

// Implementation
override fun updateGym(id: Long, name: String, location: String): Gym {
    val gym = getById(id) // Uses existing getById which throws if not found
    // Optional: Check if name exists on *other* gyms (exclude self)
    gym.name = name
    gym.location = location
    return gymRepository.save(gym)
}
```

## 2. Exercise Feature (`exercise.kt`)

### Controller Change
Add a `PUT` endpoint to `ExerciseController`.

```kotlin
@PutMapping("/{id}")
fun updateExercise(@PathVariable id: Long, @RequestBody request: ExerciseRequest): Response {
    val exercise = exerciseService.update(
        id,
        request.name,
        request.description,
        request.mainMuscles,
        request.supportMuscles,
        request.cues
    )
    return success(exercise.toResponse())
}
```

### Service Change
Add `update` to `ExerciseService` and implementation.

```kotlin
// Interface
fun update(id: Long, name: String, description: String?, mainMuscleIds: Set<Long>, supportMuscleIds: Set<Long>, cues: List<String>): Exercise

// Implementation
override fun update(id: Long, ...): Exercise {
    val exercise = getById(id)
    val mainMuscles = mainMuscleIds.map { muscleService.getById(it) }
    val supportMuscles = supportMuscleIds.map { muscleService.getById(it) }
    
    exercise.name = name
    exercise.description = description
    
    exercise.mainMuscles.clear()
    exercise.mainMuscles.addAll(mainMuscles)
    
    exercise.supportMuscles.clear()
    exercise.supportMuscles.addAll(supportMuscles)
    
    exercise.cues.clear()
    exercise.cues.addAll(cues)
    
    return exerciseRepository.save(exercise)
}
```

## 3. Routine Feature (`routine.kt`)

### Controller Change
Add a `PUT` endpoint to `RoutineController`.

```kotlin
@PutMapping("/{id}")
fun updateRoutine(@PathVariable id: Long, @RequestBody request: RoutineRequest): Response {
    val routine = routineService.updateRoutine(
        id,
        request.name,
        request.description,
        request.targetIds,
        request.checklist,
        request.note
    )
    return success(routine.toResponse())
}
```

### Service Change
Add `updateRoutine` to `RoutineService` and implementation.

```kotlin
// Interface
fun updateRoutine(id: Long, name: String, description: String?, targetIds: Set<Long>, checklist: List<ChecklistItem>, note: String?): Routine

// Implementation
override fun updateRoutine(id: Long, ...): Routine {
    val routine = getById(id)
    val targets = targetIds.map { targetService.getById(it) }
    
    routine.name = name
    routine.description = description
    routine.note = note
    
    routine.target.clear()
    routine.target.addAll(targets)
    
    routine.checklist.clear()
    routine.checklist.addAll(checklist)
    
    return routineRepository.save(routine)
}
```

## 4. Workout Feature (`workout.kt`)

### Controller Change
Expose the existing update logic via a standard PUT endpoint.

```kotlin
@PutMapping("/{id}")
fun updateWorkout(@PathVariable id: Long, @RequestBody request: WorkoutRequest): Response {
    // Re-use existing update method but ensure ID matches path variable
    val workout = workoutService.update(
        id,
        request.startTime,
        request.endTime,
        request.gym, // Gym ID
        request.routine, // Routine ID
        request.target, // Target IDs
        request.note
    )
    return success(workout.toResponse())
}
```

## 5. Muscle Feature (`muscle.kt` - Assumption)
(Assuming `muscle.kt` is similar to `gym.kt`)
- Needs `MuscleController` `@PutMapping("/{id}")`
- Needs `MuscleService.update(...)`
