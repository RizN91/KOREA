import pygame
import math

# Constants for screen
WIDTH, HEIGHT = 800, 600
TRACK_COLOR = (50, 150, 50)
TRACK_BORDER = (30, 30, 30)
CAR_COLOR = (255, 0, 0)

pygame.init()
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Simple Mario Kart Clone")
clock = pygame.time.Clock()

# Load or generate track surface
track = pygame.Surface((WIDTH, HEIGHT))
track.fill(TRACK_COLOR)
pygame.draw.rect(track, TRACK_BORDER, (50, 50, WIDTH-100, HEIGHT-100), 10)

class Car:
    def __init__(self):
        self.x = WIDTH // 2
        self.y = HEIGHT - 100
        self.angle = 0
        self.speed = 0
        self.max_speed = 5
        self.acceleration = 0.1
        self.friction = 0.05

    def update(self):
        keys = pygame.key.get_pressed()
        if keys[pygame.K_UP]:
            self.speed += self.acceleration
        if keys[pygame.K_DOWN]:
            self.speed -= self.acceleration
        if keys[pygame.K_LEFT]:
            self.angle += 4
        if keys[pygame.K_RIGHT]:
            self.angle -= 4

        self.speed = max(-self.max_speed, min(self.speed, self.max_speed))
        if self.speed > 0:
            self.speed -= self.friction
        elif self.speed < 0:
            self.speed += self.friction

        rad = math.radians(self.angle)
        self.x += self.speed * math.sin(rad)
        self.y += self.speed * math.cos(rad)

    def draw(self, surface):
        rect = pygame.Rect(0, 0, 40, 20)
        rect.center = (self.x, self.y)
        rotated = pygame.transform.rotate(pygame.Surface(rect.size), self.angle)
        rotated.fill(CAR_COLOR)
        new_rect = rotated.get_rect(center=rect.center)
        surface.blit(rotated, new_rect)

car = Car()

running = True
while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False

    car.update()

    screen.blit(track, (0, 0))
    car.draw(screen)

    pygame.display.flip()
    clock.tick(60)

pygame.quit()
