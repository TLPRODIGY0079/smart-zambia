/**
 * Confetti Animation Library
 * 
 * Lightweight confetti animation system for celebration effects.
 * Creates colorful confetti particles that fall and rotate naturally.
 * 
 * Features:
 * - Canvas-based rendering for smooth performance
 * - Customizable colors, particle count, and duration
 * - Physics-based animation with gravity and rotation
 * - Mobile-optimized with reduced particle count
 * - Auto-cleanup after animation completes
 */

(function() {
  'use strict';

  /**
   * Confetti particle class
   */
  class ConfettiParticle {
    constructor(x, y, color) {
      // Position
      this.x = x;
      this.y = y;
      
      // Velocity
      this.vx = (Math.random() - 0.5) * 10; // Horizontal velocity
      this.vy = Math.random() * -15 - 5; // Vertical velocity (upward)
      
      // Appearance
      this.color = color;
      this.size = Math.random() * 8 + 4; // Size between 4-12px
      this.rotation = Math.random() * 360; // Initial rotation
      this.rotationSpeed = (Math.random() - 0.5) * 10; // Rotation speed
      
      // Physics
      this.gravity = 0.5; // Gravity acceleration
      this.drag = 0.98; // Air resistance
      
      // Lifecycle
      this.opacity = 1;
      this.fadeRate = 0.015; // How fast particle fades
    }
    
    /**
     * Update particle position and physics
     */
    update() {
      // Apply gravity
      this.vy += this.gravity;
      
      // Apply drag
      this.vx *= this.drag;
      this.vy *= this.drag;
      
      // Update position
      this.x += this.vx;
      this.y += this.vy;
      
      // Update rotation
      this.rotation += this.rotationSpeed;
      
      // Fade out
      this.opacity -= this.fadeRate;
    }
    
    /**
     * Draw particle on canvas
     */
    draw(ctx) {
      ctx.save();
      
      // Set opacity
      ctx.globalAlpha = this.opacity;
      
      // Move to particle position
      ctx.translate(this.x, this.y);
      
      // Rotate
      ctx.rotate(this.rotation * Math.PI / 180);
      
      // Draw rectangle (confetti piece)
      ctx.fillStyle = this.color;
      ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size / 2);
      
      ctx.restore();
    }
    
    /**
     * Check if particle is still visible
     */
    isAlive() {
      return this.opacity > 0 && this.y < window.innerHeight + 100;
    }
  }

  /**
   * Confetti animation manager
   */
  class ConfettiManager {
    constructor() {
      this.canvas = null;
      this.ctx = null;
      this.particles = [];
      this.animationFrame = null;
      this.isAnimating = false;
    }
    
    /**
     * Initialize canvas for confetti
     */
    initCanvas() {
      // Create canvas if it doesn't exist
      if (!this.canvas) {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'confetti-canvas';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none'; // Don't block clicks
        this.canvas.style.zIndex = '9999'; // Above everything
        document.body.appendChild(this.canvas);
        
        this.ctx = this.canvas.getContext('2d');
      }
      
      // Set canvas size to window size
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }
    
    /**
     * Create confetti particles
     */
    createParticles(count, colors) {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 3; // Start from upper third
      
      for (let i = 0; i < count; i++) {
        // Random position near center
        const x = centerX + (Math.random() - 0.5) * 200;
        const y = centerY + (Math.random() - 0.5) * 100;
        
        // Random color from palette
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        // Create particle
        this.particles.push(new ConfettiParticle(x, y, color));
      }
    }
    
    /**
     * Animation loop
     */
    animate() {
      // Clear canvas
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      // Update and draw particles
      this.particles = this.particles.filter(particle => {
        particle.update();
        particle.draw(this.ctx);
        return particle.isAlive();
      });
      
      // Continue animation if particles remain
      if (this.particles.length > 0) {
        this.animationFrame = requestAnimationFrame(() => this.animate());
      } else {
        this.stop();
      }
    }
    
    /**
     * Start confetti animation
     */
    start(options = {}) {
      // Default options
      const defaults = {
        particleCount: 100,
        colors: [
          '#FF6B6B', // Red
          '#4ECDC4', // Teal
          '#45B7D1', // Blue
          '#FFA07A', // Orange
          '#98D8C8', // Mint
          '#F7DC6F', // Yellow
          '#BB8FCE', // Purple
          '#85C1E2'  // Light blue
        ]
      };
      
      // Merge options with defaults
      const config = { ...defaults, ...options };
      
      // Reduce particle count on mobile for performance
      if (window.innerWidth < 768) {
        config.particleCount = Math.floor(config.particleCount * 0.5);
      }
      
      // Initialize canvas
      this.initCanvas();
      
      // Stop any existing animation
      if (this.isAnimating) {
        this.stop();
      }
      
      // Create particles
      this.createParticles(config.particleCount, config.colors);
      
      // Start animation
      this.isAnimating = true;
      this.animate();
      
      console.log(`🎊 Confetti animation started with ${config.particleCount} particles`);
    }
    
    /**
     * Stop confetti animation and cleanup
     */
    stop() {
      // Cancel animation frame
      if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame);
        this.animationFrame = null;
      }
      
      // Clear particles
      this.particles = [];
      
      // Remove canvas after a delay
      if (this.canvas) {
        setTimeout(() => {
          if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
            this.canvas = null;
            this.ctx = null;
          }
        }, 100);
      }
      
      this.isAnimating = false;
      console.log('🎊 Confetti animation stopped');
    }
  }

  /**
   * Global confetti manager instance
   */
  const confettiManager = new ConfettiManager();

  /**
   * Global API - trigger confetti animation
   * 
   * @param {object} options - Configuration options
   * @param {number} options.particleCount - Number of confetti particles (default: 100)
   * @param {Array<string>} options.colors - Array of color hex codes (default: colorful palette)
   * 
   * @example
   * // Basic usage
   * window.triggerConfetti();
   * 
   * // Custom particle count
   * window.triggerConfetti({ particleCount: 150 });
   * 
   * // Custom colors
   * window.triggerConfetti({ 
   *   colors: ['#FF0000', '#00FF00', '#0000FF'] 
   * });
   */
  window.triggerConfetti = function(options) {
    confettiManager.start(options);
  };

  /**
   * Stop confetti animation
   */
  window.stopConfetti = function() {
    confettiManager.stop();
  };

  console.log('✓ Confetti library loaded');

})();
