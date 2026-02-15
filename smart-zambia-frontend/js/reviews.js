// =============================================
// REVIEWS & RATINGS MODULE
// =============================================

const ReviewsModule = {
  currentDestination: null,
  currentPage: 1,
  sortBy: 'recent',
  
  // =============================================
  // LOAD REVIEWS
  // =============================================
  async loadReviews(destinationId, page = 1, sort = 'recent') {
    try {
      const response = await fetch(
        `${API_URL}/destinations/${destinationId}/reviews?page=${page}&limit=10&sort=${sort}`
      );
      
      if (!response.ok) throw new Error('Failed to load reviews');
      
      const data = await response.json();
      this.renderReviews(data);
      this.renderRatingSummary(data.summary);
      this.renderPagination(data.pagination);
      
      return data;
    } catch (error) {
      console.error('Error loading reviews:', error);
      this.showError('Failed to load reviews');
      return null;
    }
  },
  
  // =============================================
  // RENDER REVIEWS
  // =============================================
  renderReviews(data) {
    const container = document.getElementById('reviewsList');
    if (!container) return;
    
    if (!data.reviews || data.reviews.length === 0) {
      container.innerHTML = `
        <div class="text-center py-12">
          <i class="fas fa-star text-4xl mb-4" style="color: var(--text-secondary); opacity: 0.3"></i>
          <p class="text-lg font-semibold" style="color: var(--text-primary)">No reviews yet</p>
          <p style="color: var(--text-secondary)">Be the first to review this destination!</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = data.reviews.map(review => this.renderReviewCard(review)).join('');
  },
  
  renderReviewCard(review) {
    const date = new Date(review.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
    const initials = review.user_name.split(' ').map(n => n[0]).join('').toUpperCase();
    
    return `
      <div class="rounded-2xl p-6 mb-4" style="background: var(--bg-card); border: 1px solid var(--border-color);">
        <!-- Header -->
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-full bg-gradient-to-br from-zambia-orange to-zambia-copper flex items-center justify-center text-white font-bold">
              ${initials}
            </div>
            <div>
              <h4 class="font-bold" style="color: var(--text-primary)">${review.user_name}</h4>
              <div class="flex items-center gap-2 text-sm">
                <span class="text-yellow-500">${stars}</span>
                <span style="color: var(--text-secondary)">•</span>
                <span style="color: var(--text-secondary)">${date}</span>
                ${review.is_verified ? '<span class="px-2 py-0.5 rounded-full text-xs font-semibold" style="background: rgba(34,197,94,0.1); color: #16A34A;"><i class="fas fa-check-circle mr-1"></i>Verified</span>' : ''}
              </div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-2xl font-bold" style="color: var(--text-primary)">${review.rating}.0</div>
            <div class="text-xs" style="color: var(--text-secondary)">out of 5</div>
          </div>
        </div>
        
        <!-- Title -->
        <h3 class="text-lg font-bold mb-2" style="color: var(--text-primary)">${review.title}</h3>
        
        <!-- Review Text -->
        <p class="mb-4 leading-relaxed" style="color: var(--text-secondary)">${review.review_text}</p>
        
        <!-- Visit Date -->
        ${review.visit_date ? `
          <p class="text-sm mb-4" style="color: var(--text-secondary)">
            <i class="fas fa-calendar mr-2"></i>Visited: ${new Date(review.visit_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
          </p>
        ` : ''}
        
        <!-- Photos -->
        ${review.photo_count > 0 ? `
          <div class="flex gap-2 mb-4 overflow-x-auto">
            <button onclick="ReviewsModule.loadReviewPhotos(${review.id})" class="px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-105" style="background: var(--bg-primary); color: var(--text-primary);">
              <i class="fas fa-images mr-2"></i>View ${review.photo_count} photo${review.photo_count > 1 ? 's' : ''}
            </button>
          </div>
        ` : ''}
        
        <!-- Actions -->
        <div class="flex items-center gap-4 pt-4" style="border-top: 1px solid var(--border-color);">
          <button onclick="ReviewsModule.toggleHelpful(${review.id})" 
                  class="flex items-center gap-2 text-sm font-semibold transition-all hover:text-green-600"
                  style="color: var(--text-secondary)">
            <i class="fas fa-thumbs-up"></i>
            <span>Helpful (${review.helpful_count})</span>
          </button>
          ${review.response_count > 0 ? `
            <button onclick="ReviewsModule.loadReviewResponses(${review.id})" 
                    class="flex items-center gap-2 text-sm font-semibold transition-all hover:text-blue-600"
                    style="color: var(--text-secondary)">
              <i class="fas fa-comment"></i>
              <span>${review.response_count} response${review.response_count > 1 ? 's' : ''}</span>
            </button>
          ` : ''}
          <button onclick="ReviewsModule.reportReview(${review.id})" 
                  class="ml-auto text-sm font-semibold transition-all hover:text-red-600"
                  style="color: var(--text-secondary)">
            <i class="fas fa-flag"></i>
          </button>
        </div>
      </div>
    `;
  },
  
  // =============================================
  // RENDER RATING SUMMARY
  // =============================================
  renderRatingSummary(summary) {
    const container = document.getElementById('ratingSummary');
    if (!container || !summary) return;
    
    const avgRating = parseFloat(summary.average_rating) || 0;
    const totalReviews = parseInt(summary.total_reviews) || 0;
    
    if (totalReviews === 0) {
      container.innerHTML = `
        <div class="text-center py-8">
          <div class="text-5xl font-bold mb-2" style="color: var(--text-primary)">—</div>
          <div class="text-yellow-500 text-2xl mb-2">☆☆☆☆☆</div>
          <p style="color: var(--text-secondary)">No ratings yet</p>
        </div>
      `;
      return;
    }
    
    const stars = '★'.repeat(Math.round(avgRating)) + '☆'.repeat(5 - Math.round(avgRating));
    
    const ratingBars = [
      { stars: 5, count: parseInt(summary.five_star) || 0 },
      { stars: 4, count: parseInt(summary.four_star) || 0 },
      { stars: 3, count: parseInt(summary.three_star) || 0 },
      { stars: 2, count: parseInt(summary.two_star) || 0 },
      { stars: 1, count: parseInt(summary.one_star) || 0 }
    ];
    
    container.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Overall Rating -->
        <div class="text-center p-6 rounded-2xl" style="background: var(--bg-primary);">
          <div class="text-5xl font-bold mb-2" style="color: var(--text-primary)">${avgRating.toFixed(1)}</div>
          <div class="text-yellow-500 text-2xl mb-2">${stars}</div>
          <p style="color: var(--text-secondary)">${totalReviews} review${totalReviews > 1 ? 's' : ''}</p>
        </div>
        
        <!-- Rating Breakdown -->
        <div class="space-y-2">
          ${ratingBars.map(bar => {
            const percentage = totalReviews > 0 ? (bar.count / totalReviews * 100).toFixed(0) : 0;
            return `
              <div class="flex items-center gap-3">
                <span class="text-sm font-semibold w-12" style="color: var(--text-primary)">${bar.stars} ★</span>
                <div class="flex-1 h-3 rounded-full overflow-hidden" style="background: var(--border-color);">
                  <div class="h-full bg-yellow-500 transition-all" style="width: ${percentage}%"></div>
                </div>
                <span class="text-sm font-semibold w-12 text-right" style="color: var(--text-secondary)">${bar.count}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },
  
  // =============================================
  // WRITE REVIEW
  // =============================================
  openReviewModal(destinationId, destinationName) {
    this.currentDestination = { id: destinationId, name: destinationName };
    
    const modal = document.getElementById('writeReviewModal');
    if (!modal) {
      this.createReviewModal();
    }
    
    document.getElementById('reviewDestinationName').textContent = destinationName;
    document.getElementById('writeReviewModal').classList.add('active');
    document.body.style.overflow = 'hidden';
  },
  
  createReviewModal() {
    const modal = document.createElement('div');
    modal.id = 'writeReviewModal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content p-8 max-w-2xl">
        <div class="flex justify-between items-center mb-6">
          <div>
            <h2 class="text-2xl font-bold" style="color: var(--text-primary)">Write a Review</h2>
            <p style="color: var(--text-secondary)">for <span id="reviewDestinationName" class="font-semibold"></span></p>
          </div>
          <button onclick="ReviewsModule.closeReviewModal()" class="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110" style="background: var(--bg-primary); color: var(--text-primary);">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <form id="reviewForm" onsubmit="ReviewsModule.submitReview(event)">
          <!-- Rating -->
          <div class="mb-6">
            <label class="block text-sm font-semibold mb-3" style="color: var(--text-secondary)">Your Rating *</label>
            <div class="flex gap-2">
              ${[1,2,3,4,5].map(star => `
                <button type="button" class="rating-star w-12 h-12 rounded-lg text-2xl transition-all hover:scale-110" data-rating="${star}" onclick="ReviewsModule.setRating(${star})" style="background: var(--bg-primary); color: var(--text-secondary);">
                  ☆
                </button>
              `).join('')}
            </div>
            <input type="hidden" id="reviewRating" required>
          </div>
          
          <!-- Title -->
          <div class="mb-6">
            <label class="block text-sm font-semibold mb-2" style="color: var(--text-secondary)">Review Title *</label>
            <input type="text" id="reviewTitle" required minlength="5" maxlength="200" class="input-field" placeholder="Sum up your experience">
          </div>
          
          <!-- Review Text -->
          <div class="mb-6">
            <label class="block text-sm font-semibold mb-2" style="color: var(--text-secondary)">Your Review *</label>
            <textarea id="reviewText" required minlength="20" rows="6" class="input-field" placeholder="Share your experience... What did you love? What could be improved?"></textarea>
            <p class="text-xs mt-1" style="color: var(--text-secondary)">Minimum 20 characters</p>
          </div>
          
          <!-- Visit Date -->
          <div class="mb-6">
            <label class="block text-sm font-semibold mb-2" style="color: var(--text-secondary)">When did you visit?</label>
            <input type="date" id="reviewVisitDate" class="input-field" max="${new Date().toISOString().split('T')[0]}">
          </div>
          
          <!-- Photos -->
          <div class="mb-6">
            <label class="block text-sm font-semibold mb-2" style="color: var(--text-secondary)">Add Photos (Optional)</label>
            <div class="border-2 border-dashed rounded-xl p-6 text-center" style="border-color: var(--border-color);">
              <i class="fas fa-camera text-3xl mb-3" style="color: var(--text-secondary)"></i>
              <p class="mb-3" style="color: var(--text-primary)">Upload photos from your visit</p>
              <input type="file" id="reviewPhotos" multiple accept="image/*" class="hidden" onchange="ReviewsModule.handlePhotoUpload(event)">
              <button type="button" onclick="document.getElementById('reviewPhotos').click()" class="px-4 py-2 rounded-lg font-semibold" style="background: var(--bg-primary); color: var(--text-primary);">
                Choose Photos
              </button>
            </div>
            <div id="reviewPhotoPreview" class="grid grid-cols-4 gap-2 mt-3"></div>
          </div>
          
          <!-- Submit -->
          <div class="flex gap-3">
            <button type="button" onclick="ReviewsModule.closeReviewModal()" class="flex-1 py-3 rounded-xl font-semibold" style="background: var(--bg-primary); color: var(--text-primary);">
              Cancel
            </button>
            <button type="submit" class="flex-1 py-3 rounded-xl font-semibold text-white" style="background: linear-gradient(135deg, #E85D04, #C45508);">
              <i class="fas fa-paper-plane mr-2"></i>Submit Review
            </button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
  },
  
  setRating(rating) {
    document.getElementById('reviewRating').value = rating;
    document.querySelectorAll('.rating-star').forEach((star, index) => {
      if (index < rating) {
        star.textContent = '★';
        star.style.color = '#F59E0B';
        star.style.background = 'rgba(245,158,11,0.1)';
      } else {
        star.textContent = '☆';
        star.style.color = 'var(--text-secondary)';
        star.style.background = 'var(--bg-primary)';
      }
    });
  },
  
  handlePhotoUpload(event) {
    const files = Array.from(event.target.files);
    const preview = document.getElementById('reviewPhotoPreview');
    
    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is too large. Max 5MB per photo.`);
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const div = document.createElement('div');
        div.className = 'relative rounded-lg overflow-hidden group';
        div.innerHTML = `
          <img src="${e.target.result}" class="w-full h-24 object-cover">
          <button type="button" class="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-all" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
          </button>
        `;
        preview.appendChild(div);
      };
      reader.readAsDataURL(file);
    });
  },
  
  async submitReview(event) {
    event.preventDefault();
    
    const rating = parseInt(document.getElementById('reviewRating').value);
    const title = document.getElementById('reviewTitle').value.trim();
    const review_text = document.getElementById('reviewText').value.trim();
    const visit_date = document.getElementById('reviewVisitDate').value || null;
    
    if (!rating) {
      alert('Please select a rating');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_URL}/destinations/${this.currentDestination.id}/reviews`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ rating, title, review_text, visit_date })
        }
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit review');
      }
      
      const data = await response.json();
      
      // Show success
      if (window.showAchievementToast) {
        showAchievementToast('Review Submitted!', `+${data.reward.xp} XP`);
      }
      
      // Reload reviews
      this.loadReviews(this.currentDestination.id);
      this.closeReviewModal();
      
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(error.message);
    }
  },
  
  closeReviewModal() {
    document.getElementById('writeReviewModal').classList.remove('active');
    document.body.style.overflow = '';
    document.getElementById('reviewForm').reset();
    document.getElementById('reviewPhotoPreview').innerHTML = '';
  },
  
  // =============================================
  // HELPFUL VOTES
  // =============================================
  async toggleHelpful(reviewId) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/reviews/${reviewId}/helpful`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to mark helpful');
      
      const data = await response.json();
      
      // Reload reviews to update count
      if (this.currentDestination) {
        this.loadReviews(this.currentDestination.id, this.currentPage, this.sortBy);
      }
      
    } catch (error) {
      console.error('Error marking helpful:', error);
      alert('Please log in to mark reviews as helpful');
    }
  },
  
  // =============================================
  // PAGINATION & SORTING
  // =============================================
  renderPagination(pagination) {
    const container = document.getElementById('reviewsPagination');
    if (!container || pagination.pages <= 1) {
      if (container) container.innerHTML = '';
      return;
    }
    
    const pages = [];
    for (let i = 1; i <= pagination.pages; i++) {
      if (i === 1 || i === pagination.pages || (i >= pagination.page - 1 && i <= pagination.page + 1)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }
    
    container.innerHTML = `
      <div class="flex items-center justify-center gap-2 mt-6">
        <button onclick="ReviewsModule.changePage(${pagination.page - 1})" 
                ${pagination.page === 1 ? 'disabled' : ''}
                class="px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                style="background: var(--bg-primary); color: var(--text-primary);">
          <i class="fas fa-chevron-left"></i>
        </button>
        
        ${pages.map(page => {
          if (page === '...') {
            return '<span class="px-3 py-2">...</span>';
          }
          return `
            <button onclick="ReviewsModule.changePage(${page})"
                    class="px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105 ${page === pagination.page ? 'text-white' : ''}"
                    style="background: ${page === pagination.page ? 'linear-gradient(135deg, #E85D04, #C45508)' : 'var(--bg-primary)'}; color: ${page === pagination.page ? 'white' : 'var(--text-primary)'};">
              ${page}
            </button>
          `;
        }).join('')}
        
        <button onclick="ReviewsModule.changePage(${pagination.page + 1})" 
                ${pagination.page === pagination.pages ? 'disabled' : ''}
                class="px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                style="background: var(--bg-primary); color: var(--text-primary);">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    `;
  },
  
  changePage(page) {
    if (this.currentDestination) {
      this.currentPage = page;
      this.loadReviews(this.currentDestination.id, page, this.sortBy);
      document.getElementById('reviewsList').scrollIntoView({ behavior: 'smooth' });
    }
  },
  
  changeSort(sort) {
    this.sortBy = sort;
    if (this.currentDestination) {
      this.loadReviews(this.currentDestination.id, 1, sort);
    }
  },
  
  // =============================================
  // UTILITY
  // =============================================
  showError(message) {
    if (window.showAchievementToast) {
      showAchievementToast('Error', message);
    } else {
      alert(message);
    }
  }
};

// Export to window
window.ReviewsModule = ReviewsModule;
