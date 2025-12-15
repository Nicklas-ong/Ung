document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const commentForm = document.getElementById('commentForm');
    const commentTextarea = document.getElementById('comment');
    const charCount = document.getElementById('charCount');
    const stars = document.querySelectorAll('.star');
    const ratingInput = document.getElementById('rating');
    const commentsList = document.getElementById('commentsList');
    const successModal = document.getElementById('successModal');
    const closeModal = document.querySelector('.close-modal');
    const modalOkBtn = document.getElementById('modalOkBtn');
    
    // Character counter for textarea
    commentTextarea.addEventListener('input', function() {
        const length = this.value.length;
        charCount.textContent = length;
        
        if (length > 500) {
            this.value = this.value.substring(0, 500);
            charCount.textContent = 500;
            charCount.style.color = '#e74c3c';
        } else if (length > 450) {
            charCount.style.color = '#e67e22';
        } else {
            charCount.style.color = '#95a5a6';
        }
    });
    
    // Star rating system
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const value = this.getAttribute('data-value');
            ratingInput.value = value;
            
            // Update star display
            stars.forEach(s => {
                if (s.getAttribute('data-value') <= value) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
        });
        
        // Hover effect
        star.addEventListener('mouseover', function() {
            const value = this.getAttribute('data-value');
            stars.forEach(s => {
                if (s.getAttribute('data-value') <= value) {
                    s.style.color = '#FFD700';
                }
            });
        });
        
        star.addEventListener('mouseout', function() {
            const currentRating = ratingInput.value;
            stars.forEach(s => {
                if (s.getAttribute('data-value') > currentRating) {
                    s.style.color = '#ddd';
                }
            });
        });
    });
    
    // Load comments from localStorage
    function loadComments() {
        const savedComments = localStorage.getItem('yinsinComments');
        if (savedComments) {
            const comments = JSON.parse(savedComments);
            displayComments(comments);
        }
    }
    
    // Display comments
    function displayComments(comments) {
        if (comments.length === 0) {
            commentsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-comment-slash"></i>
                    <p>还没有留言，成为第一个留言的人吧！</p>
                </div>
            `;
            return;
        }
        
        // Sort by date (newest first)
        comments.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        let html = '';
        comments.forEach(comment => {
            const date = new Date(comment.date).toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            // Create stars for rating
            let starsHtml = '';
            for (let i = 1; i <= 5; i++) {
                starsHtml += i <= comment.rating ? '★' : '☆';
            }
            
            // Get first letter of name for avatar
            const firstLetter = comment.name ? comment.name.charAt(0).toUpperCase() : 'U';
            
            html += `
                <div class="comment-card">
                    <div class="comment-header">
                        <div class="comment-author">
                            <div class="avatar">${firstLetter}</div>
                            <div class="author-info">
                                <h4>${comment.name}</h4>
                                <div class="comment-date">${date}</div>
                            </div>
                        </div>
                        <div class="comment-rating" title="评分: ${comment.rating}/5">
                            ${starsHtml}
                        </div>
                    </div>
                    <div class="comment-content">
                        ${comment.comment.replace(/\n/g, '<br>')}
                    </div>
                </div>
            `;
        });
        
        commentsList.innerHTML = html;
    }
    
    // Form submission
    commentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const comment = document.getElementById('comment').value.trim();
        const rating = ratingInput.value || 0;
        
        if (!name || !comment) {
            alert('请填写姓名和留言内容！');
            return;
        }
        
        // Create comment object
        const newComment = {
            id: Date.now(),
            name: name,
            email: email || '',
            comment: comment,
            rating: parseInt(rating),
            date: new Date().toISOString()
        };
        
        // Get existing comments
        let comments = [];
        const savedComments = localStorage.getItem('yinsinComments');
        if (savedComments) {
            comments = JSON.parse(savedComments);
        }
        
        // Add new comment
        comments.unshift(newComment);
        
        // Save to localStorage
        localStorage.setItem('yinsinComments', JSON.stringify(comments));
        
        // Reset form
        commentForm.reset();
        ratingInput.value = 0;
        charCount.textContent = '0';
        charCount.style.color = '#95a5a6';
        
        // Reset stars
        stars.forEach(star => {
            star.classList.remove('active');
            star.style.color = '#ddd';
        });
        
        // Update display
        loadComments();
        
        // Show success modal
        showSuccessModal();
    });
    
    // Show success modal
    function showSuccessModal() {
        successModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
    
    // Close modal
    function closeSuccessModal() {
        successModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
    // Event listeners for modal
    closeModal.addEventListener('click', closeSuccessModal);
    modalOkBtn.addEventListener('click', closeSuccessModal);
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === successModal) {
            closeSuccessModal();
        }
    });
    
    // Export comments function (for you to read them)
    window.exportComments = function() {
        const savedComments = localStorage.getItem('yinsinComments');
        if (!savedComments) {
            alert('暂时没有留言');
            return;
        }
        
        const comments = JSON.parse(savedComments);
        
        // Create downloadable JSON file
        const dataStr = JSON.stringify(comments, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `yinsin_comments_${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };
    
    // Add export button (hidden by default, you can access via console)
    const exportBtn = document.createElement('button');
    exportBtn.textContent = '导出留言数据';
    exportBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #2c3e50;
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 25px;
        cursor: pointer;
        z-index: 1000;
        font-size: 14px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        opacity: 0.7;
        transition: opacity 0.3s;
    `;
    exportBtn.addEventListener('mouseover', () => exportBtn.style.opacity = '1');
    exportBtn.addEventListener('mouseout', () => exportBtn.style.opacity = '0.7');
    exportBtn.addEventListener('click', window.exportComments);
    document.body.appendChild(exportBtn);
    
    // Initial load
    loadComments();
});