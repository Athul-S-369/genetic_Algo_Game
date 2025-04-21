import pygame
import random
import math

# Initialize Pygame
pygame.init()

# Constants
WINDOW_WIDTH = 800
WINDOW_HEIGHT = 600
WHITE = (255, 255, 255)
RED = (220, 53, 69)
GREEN = (40, 167, 69)
BLUE = (0, 123, 255)
BLACK = (52, 58, 64)

# Game settings
POPULATION_SIZE = 20
MUTATION_RATE = 0.1
TARGET_COUNT = 5
GENERATION_TIME = 10000  # 10 seconds per generation

class Target:
    def __init__(self):
        self.x = random.random() * WINDOW_WIDTH
        self.y = random.random() * WINDOW_HEIGHT
        self.collected = False

    def draw(self, screen):
        if not self.collected:
            pygame.draw.circle(screen, RED, (int(self.x), int(self.y)), 5)

class Individual:
    def __init__(self):
        self.genes = {
            'x': random.random() * WINDOW_WIDTH,
            'y': random.random() * WINDOW_HEIGHT,
            'speed': random.random() * 5,
            'angle': random.random() * 360,
            'size': random.random() * 3 + 1,
            'color': (random.randint(0, 255), random.randint(0, 255), random.randint(0, 255))
        }
        self.fitness = 0
        self.trail = []
        self.collected_targets = 0

    @classmethod
    def crossover(cls, parent1, parent2):
        child = cls()
        # Randomly choose genes from parents
        for gene in parent1.genes:
            if random.random() < 0.5:
                child.genes[gene] = parent1.genes[gene]
            else:
                child.genes[gene] = parent2.genes[gene]
        return child

    def mutate(self):
        if random.random() < MUTATION_RATE:
            gene = random.choice(list(self.genes.keys()))
            if gene == 'color':
                self.genes[gene] = (random.randint(0, 255), random.randint(0, 255), random.randint(0, 255))
            elif gene == 'angle':
                self.genes[gene] = random.random() * 360
            else:
                self.genes[gene] *= random.uniform(0.8, 1.2)

    def update_position(self):
        # Add current position to trail
        self.trail.insert(0, (self.genes['x'], self.genes['y']))
        if len(self.trail) > 5:
            self.trail.pop()

        # Update position based on angle and speed
        radians = math.radians(self.genes['angle'])
        self.genes['x'] += math.cos(radians) * self.genes['speed']
        self.genes['y'] += math.sin(radians) * self.genes['speed']

        # Bounce off bounds
        if self.genes['x'] <= 0 or self.genes['x'] >= WINDOW_WIDTH:
            self.genes['angle'] = 180 - self.genes['angle']
        if self.genes['y'] <= 0 or self.genes['y'] >= WINDOW_HEIGHT:
            self.genes['angle'] = 360 - self.genes['angle']

        # Keep within bounds
        self.genes['x'] = max(0, min(WINDOW_WIDTH, self.genes['x']))
        self.genes['y'] = max(0, min(WINDOW_HEIGHT, self.genes['y']))

    def draw(self, screen):
        # Draw trail
        for i, pos in enumerate(self.trail):
            alpha = max(0, min(255, int(255 * (0.3 - i * 0.1))))
            r, g, b = self.genes['color']
            trail_color = (r, g, b)
            surface = pygame.Surface((4, 4))
            surface.set_alpha(alpha)
            surface.fill((0, 0, 0))
            pygame.draw.circle(surface, trail_color, (2, 2), 2)
            screen.blit(surface, (int(pos[0])-2, int(pos[1])-2))

        # Draw individual
        size = self.genes['size'] * 5
        pygame.draw.circle(screen, self.genes['color'], 
                         (int(self.genes['x']), int(self.genes['y'])), 
                         int(size))

        # Draw fitness score
        font = pygame.font.Font(None, 20)
        text = font.render(str(self.collected_targets), True, WHITE)
        text_rect = text.get_rect(center=(int(self.genes['x']), int(self.genes['y']) - int(size) - 10))
        screen.blit(text, text_rect)