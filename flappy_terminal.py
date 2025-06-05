import curses
import random
import time

# Constants for gameplay
GRAVITY = 0.1
FLAP_STRENGTH = -2
PIPE_GAP = 6
PIPE_SPACING = 20
PIPE_SPEED = 1
FRAME_DELAY = 0.05  # Seconds per frame (~20 FPS)

class Bird:
    def __init__(self, y):
        self.y = float(y)
        self.velocity = 0.0

    def flap(self):
        self.velocity = FLAP_STRENGTH

    def update(self):
        self.velocity += GRAVITY
        self.y += self.velocity

class Pipe:
    def __init__(self, x, height, gap_start):
        self.x = float(x)
        self.height = height
        self.gap_start = gap_start

    def update(self):
        self.x -= PIPE_SPEED

    def is_offscreen(self):
        return self.x < -1


def run(stdscr):
    curses.curs_set(0)
    stdscr.nodelay(True)
    stdscr.timeout(0)
    height, width = stdscr.getmaxyx()
    bird_x = width // 4
    bird = Bird(height // 2)
    pipes = []
    frame_count = 0
    score = 0

    while True:
        key = stdscr.getch()
        if key in (ord('q'), ord('Q')):
            break
        if key == ord(' ') or key == curses.KEY_UP:
            bird.flap()

        if frame_count % PIPE_SPACING == 0:
            gap_start = random.randint(2, max(2, height - PIPE_GAP - 2))
            pipes.append(Pipe(width - 1, height, gap_start))

        bird.update()
        for pipe in pipes:
            pipe.update()
        if pipes and pipes[0].is_offscreen():
            pipes.pop(0)
            score += 1

        # Collision detection
        if bird.y < 0 or bird.y >= height:
            break
        for pipe in pipes:
            if int(pipe.x) == bird_x:
                if not (pipe.gap_start <= int(bird.y) <= pipe.gap_start + PIPE_GAP):
                    return score

        # Drawing
        stdscr.erase()
        for pipe in pipes:
            x = int(pipe.x)
            if 0 <= x < width:
                for y in range(pipe.height):
                    if not (pipe.gap_start <= y <= pipe.gap_start + PIPE_GAP):
                        try:
                            stdscr.addch(y, x, '#')
                        except curses.error:
                            pass
        by = int(bird.y)
        if 0 <= by < height:
            try:
                stdscr.addch(by, bird_x, 'O')
            except curses.error:
                pass
        stdscr.addstr(0, 0, f'Score: {score}')
        stdscr.refresh()
        time.sleep(FRAME_DELAY)
        frame_count += 1

    return score

if __name__ == '__main__':
    final_score = curses.wrapper(run)
    print('Game over! Your score:', final_score)
