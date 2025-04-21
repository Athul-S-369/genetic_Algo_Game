import pygame
import random
from genetic_algo import Individual, Target, WINDOW_WIDTH, WINDOW_HEIGHT, WHITE, BLACK, BLUE
from genetic_algo import POPULATION_SIZE, TARGET_COUNT, GENERATION_TIME

# Initialize Pygame
pygame.init()

# Set up the display
screen = pygame.display.set_mode((WINDOW_WIDTH, WINDOW_HEIGHT))
pygame.display.set_caption("Genetic Algorithm Game")
clock = pygame.time.Clock()

# Game state
population = [Individual() for _ in range(POPULATION_SIZE)]
targets = [Target() for _ in range(TARGET_COUNT)]
generation = 1
generation_start_time = pygame.time.get_ticks()

# Font setup
font = pygame.font.Font(None, 36)

def select_parents():
    # Tournament selection
    tournament_size = 3
    tournament = random.sample(population, tournament_size)
    return max(tournament, key=lambda x: x.collected_targets)

def create_next_generation():
    new_population = []
    # Keep the best individual
    best_individual = max(population, key=lambda x: x.collected_targets)
    new_population.append(Individual())
    new_population[0].genes = best_individual.genes.copy()
    
    # Create rest of the population through crossover and mutation
    while len(new_population) < POPULATION_SIZE:
        parent1 = select_parents()
        parent2 = select_parents()
        child = Individual.crossover(parent1, parent2)
        child.mutate()
        new_population.append(child)
    
    return new_population

def check_collisions():
    for individual in population:
        for target in targets:
            if not target.collected:
                dx = individual.genes['x'] - target.x
                dy = individual.genes['y'] - target.y
                distance = (dx * dx + dy * dy) ** 0.5
                if distance < individual.genes['size'] * 5 + 5:  # Individual size + target size
                    target.collected = True
                    individual.collected_targets += 1

def draw_stats():
    # Draw generation number
    gen_text = font.render(f"Generation: {generation}", True, WHITE)
    screen.blit(gen_text, (10, 10))
    
    # Draw time remaining
    time_remaining = max(0, (GENERATION_TIME - (pygame.time.get_ticks() - generation_start_time)) // 1000)
    time_text = font.render(f"Time: {time_remaining}s", True, WHITE)
    screen.blit(time_text, (10, 50))
    
    # Draw best score
    best_score = max(ind.collected_targets for ind in population)
    score_text = font.render(f"Best Score: {best_score}", True, WHITE)
    screen.blit(score_text, (10, 90))

# Game loop
running = True
while running:
    # Event handling
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
    
    # Clear screen
    screen.fill(BLACK)
    
    # Update and draw individuals
    for individual in population:
        individual.update_position()
        individual.draw(screen)
    
    # Draw targets
    for target in targets:
        target.draw(screen)
    
    # Check collisions
    check_collisions()
    
    # Draw statistics
    draw_stats()
    
    # Check if generation time is up
    current_time = pygame.time.get_ticks()
    if current_time - generation_start_time >= GENERATION_TIME:
        # Create new generation
        population = create_next_generation()
        # Reset targets
        targets = [Target() for _ in range(TARGET_COUNT)]
        generation += 1
        generation_start_time = current_time
    
    # Update display
    pygame.display.flip()
    clock.tick(60)

pygame.quit()