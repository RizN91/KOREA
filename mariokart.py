import math
from pathlib import Path
import pygame

# Screen setup
WIDTH, HEIGHT = 1024, 768
BG_COLOR = (34, 139, 34)
TRACK_COLOR = (120, 120, 120)
BORDER_COLOR = (60, 60, 60)
CAR_COLOR = (255, 0, 0)

pygame.init()

# Attempt to initialise audio and load optional engine sound
engine_sound = None
try:
    pygame.mixer.init()
    if Path("engine.wav").exists():
        engine_sound = pygame.mixer.Sound("engine.wav")
except pygame.error:
    pass

screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Simple Racing Game")
clock = pygame.time.Clock()

# Build a simple oval track
track = pygame.Surface((WIDTH, HEIGHT))
track.fill(BG_COLOR)
outer = pygame.Rect(50, 50, WIDTH - 100, HEIGHT - 100)
inner = pygame.Rect(250, 200, WIDTH - 500, HEIGHT - 400)
pygame.draw.ellipse(track, TRACK_COLOR, outer)
pygame.draw.ellipse(track, BG_COLOR, inner)
pygame.draw.ellipse(track, BORDER_COLOR, outer, 5)

class Car:
    def __init__(self):
        self.base = pygame.Surface((40, 20), pygame.SRCALPHA)
        pygame.draw.polygon(self.base, CAR_COLOR, [(0, 0), (40, 10), (0, 20)])
        self.pos = pygame.Vector2(WIDTH / 2, HEIGHT / 2)
        self.angle = 0.0
        self.speed = 0.0
        self.max_speed = 8.0
        self.accel = 0.2
        self.friction = 0.05

    def update(self):
        keys = pygame.key.get_pressed()
        if keys[pygame.K_w]:
            self.speed = min(self.speed + self.accel, self.max_speed)
            if engine_sound and not pygame.mixer.get_busy():
                engine_sound.play()
        if keys[pygame.K_s]:
            self.speed = max(self.speed - self.accel, -self.max_speed / 2)
        if keys[pygame.K_a]:
            self.angle += self.speed
        if keys[pygame.K_d]:
            self.angle -= self.speed

        if self.speed > 0:
            self.speed -= self.friction
        elif self.speed < 0:
            self.speed += self.friction

        rad = math.radians(self.angle)
        self.pos.x += self.speed * math.cos(rad)
        self.pos.y -= self.speed * math.sin(rad)

        self.pos.x = max(0, min(WIDTH, self.pos.x))
        self.pos.y = max(0, min(HEIGHT, self.pos.y))

    def draw(self, surf: pygame.Surface):
        rotated = pygame.transform.rotate(self.base, self.angle)
        rect = rotated.get_rect(center=self.pos)
        surf.blit(rotated, rect)

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
