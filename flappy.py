import pygame
import random

# Game constants
WIDTH, HEIGHT = 400, 600
GRAVITY = 0.25
FLAP_STRENGTH = -6
GAP_SIZE = 150
PIPE_WIDTH = 70
PIPE_SPEED = 3


class Bird:
    def __init__(self):
        self.image = pygame.Surface((34, 24))
        self.image.fill((255, 255, 0))
        self.rect = self.image.get_rect(center=(50, HEIGHT // 2))
        self.velocity = 0

    def flap(self):
        self.velocity = FLAP_STRENGTH

    def update(self):
        self.velocity += GRAVITY
        self.rect.y += int(self.velocity)

    def draw(self, screen):
        screen.blit(self.image, self.rect)


class Pipe:
    def __init__(self, x):
        self.top_height = random.randint(50, HEIGHT - GAP_SIZE - 50)
        self.bottom_y = self.top_height + GAP_SIZE
        self.top_rect = pygame.Rect(x, 0, PIPE_WIDTH, self.top_height)
        self.bottom_rect = pygame.Rect(x, self.bottom_y, PIPE_WIDTH, HEIGHT - self.bottom_y)

    def update(self):
        self.top_rect.x -= PIPE_SPEED
        self.bottom_rect.x -= PIPE_SPEED

    def draw(self, screen):
        pygame.draw.rect(screen, (0, 255, 0), self.top_rect)
        pygame.draw.rect(screen, (0, 255, 0), self.bottom_rect)

    def off_screen(self):
        return self.top_rect.right < 0

    def collides(self, bird_rect):
        return self.top_rect.colliderect(bird_rect) or self.bottom_rect.colliderect(bird_rect)


def main():
    pygame.init()
    screen = pygame.display.set_mode((WIDTH, HEIGHT))
    clock = pygame.time.Clock()

    bird = Bird()
    pipes = [Pipe(WIDTH + 100)]
    score = 0
    font = pygame.font.SysFont(None, 36)

    running = True
    while running:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            if event.type == pygame.KEYDOWN and event.key == pygame.K_SPACE:
                bird.flap()

        bird.update()
        if bird.rect.top <= 0 or bird.rect.bottom >= HEIGHT:
            running = False

        if pipes[-1].top_rect.x < WIDTH - 200:
            pipes.append(Pipe(WIDTH))

        for pipe in list(pipes):
            pipe.update()
            if pipe.collides(bird.rect):
                running = False
            if pipe.off_screen():
                pipes.remove(pipe)
                score += 1

        screen.fill((135, 206, 235))
        bird.draw(screen)
        for pipe in pipes:
            pipe.draw(screen)

        score_surface = font.render(f"Score: {score}", True, (0, 0, 0))
        screen.blit(score_surface, (10, 10))

        pygame.display.flip()
        clock.tick(60)

    pygame.quit()


if __name__ == "__main__":
    main()
