# fridge_seal_game.py
# A Pygame-based endless runner where you play as a seal animal jumping over fridge obstacles.
# Reach level 10 to get a coupon bonus!

import pygame
import sys
import os
import random

# Constants
WIDTH, HEIGHT = 800, 600
FPS = 60
GRAVITY = 0.8
JUMP_STRENGTH = -15
FRIDGE_SPEED_START = 5
FRIDGE_SPAWN_RATE = 1500  # milliseconds
LEVEL_UP_SCORE = 100  # Increase level every 100 points
COUPON_LEVEL = 10
FONT_NAME = pygame.font.get_default_font()

# Asset directories
ASSET_DIR = os.path.join(os.path.dirname(__file__), "assets")
IMAGE_DIR = os.path.join(ASSET_DIR, "images")
SOUND_DIR = os.path.join(ASSET_DIR, "sounds")

# Ensure asset paths exist
if not os.path.isdir(IMAGE_DIR):
    print(f"Missing image directory: {IMAGE_DIR}")
    sys.exit()
if not os.path.isdir(SOUND_DIR):
    print(f"Missing sound directory: {SOUND_DIR}")
    sys.exit()

# Helper to load images
def load_image(name, colorkey=None):
    path = os.path.join(IMAGE_DIR, name)
    try:
        image = pygame.image.load(path).convert_alpha()
    except:
        print(f"Failed to load image: {path}")
        sys.exit()
    if colorkey is not None:
        image.set_colorkey(colorkey)
    return image

# Helper to load sounds
def load_sound(name):
    path = os.path.join(SOUND_DIR, name)
    try:
        sound = pygame.mixer.Sound(path)
    except:
        print(f"Failed to load sound: {path}")
        sys.exit()
    return sound

# Seal (player) class
class Seal(pygame.sprite.Sprite):
    def __init__(self):
        super().__init__()
        self.images = [load_image("seal1.png"), load_image("seal2.png"), load_image("seal3.png")]
        self.current_frame = 0
        self.image = self.images[self.current_frame]
        self.rect = self.image.get_rect(midbottom=(100, HEIGHT - 50))
        self.velocity = 0
        self.on_ground = True
        self.animation_timer = 0

    def update(self):
        # Apply gravity
        self.velocity += GRAVITY
        self.rect.y += int(self.velocity)

        # Floor collision
        if self.rect.bottom >= HEIGHT - 50:
            self.rect.bottom = HEIGHT - 50
            self.velocity = 0
            self.on_ground = True
        else:
            self.on_ground = False

        # Animate seal when running
        now = pygame.time.get_ticks()
        if now - self.animation_timer > 100:
            self.animation_timer = now
            self.current_frame = (self.current_frame + 1) % len(self.images)
            self.image = self.images[self.current_frame]

    def jump(self):
        if self.on_ground:
            self.velocity = JUMP_STRENGTH
            self.on_ground = False
            jump_sound.play()

# Fridge obstacle class
class Fridge(pygame.sprite.Sprite):
    def __init__(self, speed):
        super().__init__()
        self.image = load_image("fridge.png")
        self.rect = self.image.get_rect(midbottom=(WIDTH + 50, HEIGHT - 50))
        self.speed = speed

    def update(self):
        self.rect.x -= self.speed
        if self.rect.right < 0:
            self.kill()

# Game class to manage states
class Game:
    def __init__(self):
        pygame.init()
        pygame.mixer.init()
        self.screen = pygame.display.set_mode((WIDTH, HEIGHT))
        pygame.display.set_caption("Fridge Seal Rescue")
        self.clock = pygame.time.Clock()
        self.font = pygame.font.Font(FONT_NAME, 24)
        self.large_font = pygame.font.Font(FONT_NAME, 48)

        # Load assets
        self.bg_image = load_image("kitchen_bg.png")
        self.seal = Seal()
        self.all_sprites = pygame.sprite.Group()
        self.fridges = pygame.sprite.Group()
        self.all_sprites.add(self.seal)

        # Sounds
        global jump_sound, point_sound, levelup_sound, coupon_sound, game_over_sound
        jump_sound = load_sound("jump.wav")
        point_sound = load_sound("point.wav")
        levelup_sound = load_sound("levelup.wav")
        coupon_sound = load_sound("coupon.wav")
        game_over_sound = load_sound("game_over.wav")

        # Timers
        pygame.time.set_timer(pygame.USEREVENT + 1, FRIDGE_SPAWN_RATE)

        # Game variables
        self.score = 0
        self.level = 1
        self.fridge_speed = FRIDGE_SPEED_START
        self.running = True
        self.state = "start"  # "start", "playing", "gameover", "coupon"

    def reset(self):
        self.score = 0
        self.level = 1
        self.fridge_speed = FRIDGE_SPEED_START
        for sprite in self.fridges:
            sprite.kill()
        self.seal.rect.midbottom = (100, HEIGHT - 50)
        self.seal.velocity = 0
        self.state = "playing"

    def run(self):
        while self.running:
            self.clock.tick(FPS)
            self.events()
            self.update()
            self.draw()
        pygame.quit()
        sys.exit()

    def events(self):
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                self.running = False
            if self.state == "playing":
                if event.type == pygame.KEYDOWN:
                    if event.key == pygame.K_SPACE:
                        self.seal.jump()
                if event.type == pygame.USEREVENT + 1:
                    self.spawn_fridge()
            elif self.state == "start":
                if event.type == pygame.KEYDOWN:
                    self.reset()
            elif self.state == "gameover":
                if event.type == pygame.KEYDOWN:
                    if event.key == pygame.K_RETURN:
                        self.state = "start"
            elif self.state == "coupon":
                if event.type == pygame.KEYDOWN:
                    if event.key == pygame.K_RETURN:
                        self.state = "start"

    def update(self):
        if self.state == "playing":
            self.all_sprites.update()
            self.fridges.update()

            # Collision detection
            if pygame.sprite.spritecollideany(self.seal, self.fridges):
                game_over_sound.play()
                self.state = "gameover"

            # Update score based on time survived
            self.score += 1/FPS
            if int(self.score) > 0 and int(self.score) % LEVEL_UP_SCORE == 0:
                new_level = int(self.score) // LEVEL_UP_SCORE + 1
                if new_level > self.level:
                    self.level = new_level
                    levelup_sound.play()
                    self.fridge_speed += 1

            # Check for coupon level
            if self.level >= COUPON_LEVEL:
                coupon_sound.play()
                self.state = "coupon"

    def draw(self):
        self.screen.blit(self.bg_image, (0, 0))
        if self.state == "start":
            self.draw_text("PRESS ANY KEY TO START", self.large_font, (255, 255, 255), WIDTH//2, HEIGHT//2)
        elif self.state == "playing":
            self.all_sprites.draw(self.screen)
            self.fridges.draw(self.screen)
            self.draw_text(f"Score: {int(self.score)}", self.font, (255, 255, 255), 70, 30)
            self.draw_text(f"Level: {self.level}", self.font, (255, 255, 255), 70, 60)
        elif self.state == "gameover":
            self.draw_text("GAME OVER", self.large_font, (255, 0, 0), WIDTH//2, HEIGHT//2 - 50)
            self.draw_text(f"Final Score: {int(self.score)}", self.font, (255, 255, 255), WIDTH//2, HEIGHT//2)
            self.draw_text("Press ENTER to return to Start", self.font, (255, 255, 255), WIDTH//2, HEIGHT//2 + 50)
        elif self.state == "coupon":
            self.draw_text("CONGRATULATIONS!", self.large_font, (0, 255, 0), WIDTH//2, HEIGHT//2 - 100)
            self.draw_text("You've reached Level 10!", self.font, (255, 255, 255), WIDTH//2, HEIGHT//2 - 30)
            self.draw_text("Use code SEAL10 for a discount on your next order", self.font, (255, 255, 255), WIDTH//2, HEIGHT//2 + 10)
            self.draw_text("Press ENTER to play again", self.font, (255, 255, 255), WIDTH//2, HEIGHT//2 + 60)
        pygame.display.flip()

    def spawn_fridge(self):
        fridge = Fridge(self.fridge_speed)
        self.all_sprites.add(fridge)
        self.fridges.add(fridge)

    def draw_text(self, text, font, color, x, y):
        text_surface = font.render(text, True, color)
        text_rect = text_surface.get_rect()
        text_rect.center = (x, y)
        self.screen.blit(text_surface, text_rect)

if __name__ == "__main__":
    # Ensure working directory is script directory
    os.chdir(os.path.dirname(__file__))
    game = Game()
    game.run()
