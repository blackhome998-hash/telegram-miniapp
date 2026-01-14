// Telegram WebApp Initialization
const tg = window.Telegram.WebApp;

// Initialize Telegram WebApp
function initTelegram() {
    // Expand WebApp to full screen
    tg.expand();
    
    // Enable back button
    tg.BackButton.show();
    tg.BackButton.onClick(() => {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            tg.close();
        }
    });
    
    // Set theme colors based on Telegram theme
    if (tg.colorScheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        tg.setHeaderColor('#1e293b');
        tg.setBackgroundColor('#0f172a');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        tg.setHeaderColor('#4f46e5');
        tg.setBackgroundColor('#f8fafc');
    }
    
    // Get user data from Telegram
    const user = tg.initDataUnsafe?.user;
    if (user) {
        updateUserInfo(user);
    }
    
    // Listen for theme changes
    tg.onEvent('themeChanged', () => {
        if (tg.colorScheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
        }
    });
    
    // Send data to bot when WebApp is closing
    tg.onEvent('viewportChanged', (event) => {
        console.log('Viewport changed:', event);
    });
}

function updateUserInfo(user) {
    // Update UI with user info
    const userName = user.first_name || user.username || 'Пользователь';
    document.getElementById('userName').textContent = userName;
    
    // You can use user data in your app
    console.log('Telegram User:', user);
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    initTelegram();
    initApp(); // Your existing app initialization
});

// Telegram WebApp Initialization
const tg = window.Telegram.WebApp;

// DOM Elements
const preloader = document.getElementById('preloader');
const appContainer = document.getElementById('app-container');
const themeToggle = document.getElementById('themeToggle');
const bottomNavItems = document.querySelectorAll('.nav-item');
const pages = document.querySelectorAll('.page');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const faqItems = document.querySelectorAll('.faq-item');
const starsInput = document.querySelectorAll('.stars-input i');
const submitReviewBtn = document.getElementById('submitReviewBtn');
const copyLinkBtn = document.getElementById('copyLinkBtn');
const referralLink = document.getElementById('referralLink');

// Data
let currentUser = null;
let currentTheme = localStorage.getItem('theme') || 'light';
let userRating = 0;

// Initialize App
function initApp() {
    // Initialize Telegram WebApp
    tg.expand();
    tg.enableClosingConfirmation();
    tg.setHeaderColor('#4f46e5');
    tg.setBackgroundColor('#f8fafc');
    
    // Get user data from Telegram
    currentUser = tg.initDataUnsafe?.user || {
        id: 123456789,
        first_name: 'Гость',
        username: 'guest'
    };
    
    // Apply saved theme
    applyTheme(currentTheme);
    
    // Load user data
    loadUserData();
    
    // Hide preloader after 1.5 seconds
    setTimeout(() => {
        preloader.style.opacity = '0';
        preloader.style.visibility = 'hidden';
        appContainer.style.display = 'block';
    }, 1500);
    
    // Initialize components
    initNavigation();
    initTabs();
    initFAQ();
    initReviewSystem();
    initBalanceActions();
    initQuickActions();
    
    // Load dynamic content
    loadActiveOffers();
    loadTransactions();
    loadReviews();
    
    // Show welcome notification
    showToast('Добро пожаловать, ' + currentUser.first_name + '!', 'success');
}

// Theme Management
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const icon = themeToggle.querySelector('i');
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    localStorage.setItem('theme', theme);
}

// Navigation
function initNavigation() {
    bottomNavItems.forEach(item => {
        item.addEventListener('click', () => {
            const pageId = item.dataset.page;
            
            // Update active nav item
            bottomNavItems.forEach(navItem => navItem.classList.remove('active'));
            item.classList.add('active');
            
            // Show corresponding page
            pages.forEach(page => {
                page.classList.remove('active');
                if (page.id === pageId + 'Page') {
                    page.classList.add('active');
                    
                    // Load specific page data
                    switch(pageId) {
                        case 'home':
                            updateHomeStats();
                            break;
                        case 'balance':
                            updateBalance();
                            break;
                        case 'reviews':
                            loadReviews();
                            break;
                    }
                }
            });
        });
    });
}

// Tabs
function initTabs() {
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            
            // Update active tab button
            tabBtns.forEach(tab => tab.classList.remove('active'));
            btn.classList.add('active');
            
            // Show corresponding tab content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.dataset.tab === tabId) {
                    content.classList.add('active');
                }
            });
        });
    });
}

// FAQ Accordion
function initFAQ() {
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            item.classList.toggle('active');
        });
    });
}

// Review System
function initReviewSystem() {
    // Star rating
    starsInput.forEach(star => {
        star.addEventListener('click', () => {
            const rating = parseInt(star.dataset.rating);
            userRating = rating;
            
            starsInput.forEach((s, index) => {
                if (index < rating) {
                    s.className = 'fas fa-star active';
                } else {
                    s.className = 'far fa-star';
                }
            });
        });
    });
    
    // Submit review
    submitReviewBtn.addEventListener('click', () => {
        const reviewText = document.getElementById('reviewText').value.trim();
        
        if (userRating === 0) {
            showToast('Пожалуйста, поставьте оценку', 'error');
            return;
        }
        
        if (reviewText.length < 10) {
            showToast('Отзыв должен содержать минимум 10 символов', 'error');
            return;
        }
        
        // Add new review
        const newReview = {
            id: Date.now(),
            user: currentUser.first_name,
            rating: userRating,
            text: reviewText,
            date: new Date().toLocaleDateString('ru-RU'),
            likes: 0,
            dislikes: 0
        };
        
        // Add to reviews array (in production this would be sent to server)
        const reviews = JSON.parse(localStorage.getItem('reviews') || '[]');
        reviews.unshift(newReview);
        localStorage.setItem('reviews', JSON.stringify(reviews));
        
        // Reset form
        starsInput.forEach(star => star.className = 'far fa-star');
        document.getElementById('reviewText').value = '';
        userRating = 0;
        
        // Reload reviews
        loadReviews();
        showToast('Спасибо за ваш отзыв!', 'success');
    });
}

// Balance Actions
function initBalanceActions() {
    const withdrawBtn = document.getElementById('withdrawBtn');
    const replenishBtn = document.getElementById('replenishBtn');
    const modal = document.getElementById('withdrawModal');
    const modalClose = modal.querySelector('.modal-close');
    
    withdrawBtn.addEventListener('click', () => {
        showWithdrawModal();
    });
    
    replenishBtn.addEventListener('click', () => {
        showToast('Функция пополнения скоро будет доступна', 'info');
    });
    
    modalClose.addEventListener('click', () => {
        modal.classList.remove('active');
    });
    
    // Copy referral link
    copyLinkBtn.addEventListener('click', () => {
        referralLink.select();
        document.execCommand('copy');
        showToast('Ссылка скопирована в буфер обмена', 'success');
    });
}

// Quick Actions
function initQuickActions() {
    const quickActions = document.querySelectorAll('.quick-action');
    
    quickActions.forEach(action => {
        action.addEventListener('click', () => {
            const actionType = action.dataset.action;
            
            switch(actionType) {
                case 'invite':
                    showToast('Реферальная ссылка скопирована', 'success');
                    break;
                case 'offer':
                    // Switch to earn page with offers tab
                    document.querySelector('[data-page="earn"]').click();
                    document.querySelector('[data-tab="offers"]').click();
                    break;
                case 'support':
                    document.querySelector('[data-page="help"]').click();
                    break;
                case 'bot':
                    tg.openTelegramLink('https://t.me/finance_helper_bot');
                    break;
            }
        });
    });
}

// Load Data Functions
function loadUserData() {
    // In production, this would be an API call
    const userData = {
        balance: 1250,
        totalEarnings: 3250,
        referrals: 5,
        completedOffers: 12,
        activeDays: 7,
        holdBalance: 750
    };
    
    // Update UI
    document.getElementById('balanceAmount').textContent = userData.balance;
    document.getElementById('availableBalance').textContent = userData.balance;
    document.getElementById('totalEarnings').textContent = userData.totalEarnings + ' ₽';
    document.getElementById('referralsCount').textContent = userData.referrals;
    document.getElementById('completedOffers').textContent = userData.completedOffers;
    document.getElementById('activeDays').textContent = userData.activeDays;
    document.getElementById('totalBalance').textContent = userData.totalEarnings + ' ₽';
    document.getElementById('holdBalance').textContent = userData.holdBalance + ' ₽';
}

function loadActiveOffers() {
    const offersList = document.getElementById('activeOffers');
    const offersCount = document.getElementById('activeOffersCount');
    
    const offers = [
        { title: 'Кредитная карта Альфа-Банк', reward: 500, description: 'Оформите карту с льготным периодом', completed: 245, time: '15-30 мин' },
        { title: 'РКО для ИП в Тинькофф', reward: 300, description: 'Откройте расчетный счет для бизнеса', completed: 189, time: '20-40 мин' },
        { title: 'Микрозайм в Lime', reward: 150, description: 'Первый займ под 0%', completed: 567, time: '5-10 мин' },
        { title: 'Страхование ОСАГО', reward: 200, description: 'Оформите полис онлайн', completed: 89, time: '10-20 мин' },
        { title: 'Инвестиции в Тинькофф', reward: 400, description: 'Откройте брокерский счет', completed: 134, time: '15-25 мин' }
    ];
    
    offersCount.textContent = offers.length;
    offersList.innerHTML = '';
    
    offers.forEach(offer => {
        const offerElement = document.createElement('div');
        offerElement.className = 'offer-card';
        offerElement.innerHTML = `
            <div class="offer-header">
                <h4 class="offer-title">${offer.title}</h4>
                <span class="offer-reward">+${offer.reward} ₽</span>
            </div>
            <p class="offer-description">${offer.description}</p>
            <div class="offer-stats">
                <span><i class="fas fa-users"></i> ${offer.completed} выполнено</span>
                <span><i class="fas fa-clock"></i> ${offer.time}</span>
            </div>
        `;
        offerElement.addEventListener('click', () => {
            showToast(`Начали предложение "${offer.title}"`, 'info');
        });
        offersList.appendChild(offerElement);
    });
}

function loadTransactions() {
    const transactionsList = document.getElementById('transactionsList');
    
    const transactions = [
        { type: 'income', title: 'Кредитная карта ВТБ', amount: 500, date: 'Сегодня, 14:30' },
        { type: 'outcome', title: 'Вывод на карту', amount: 1000, date: 'Вчера, 18:15' },
        { type: 'income', title: 'Реферальное вознаграждение', amount: 150, date: '21.03.2024' },
        { type: 'income', title: 'Микрозайм Lime', amount: 150, date: '20.03.2024' },
        { type: 'income', title: 'ОСАГО', amount: 200, date: '19.03.2024' }
    ];
    
    transactionsList.innerHTML = '';
    
    transactions.forEach(transaction => {
        const transactionElement = document.createElement('div');
        transactionElement.className = 'transaction-item';
        transactionElement.innerHTML = `
            <div class="transaction-icon ${transaction.type}">
                <i class="fas ${transaction.type === 'income' ? 'fa-arrow-down' : 'fa-arrow-up'}"></i>
            </div>
            <div class="transaction-details">
                <h4 class="transaction-title">${transaction.title}</h4>
                <p class="transaction-date">${transaction.date}</p>
            </div>
            <div class="transaction-amount ${transaction.type}">
                ${transaction.type === 'income' ? '+' : '-'}${transaction.amount} ₽
            </div>
        `;
        transactionsList.appendChild(transactionElement);
    });
}

function loadReviews() {
    const reviewsList = document.getElementById('reviewsList');
    const sortSelect = document.getElementById('sortReviews');
    
    // Get reviews from localStorage or use default
    let reviews = JSON.parse(localStorage.getItem('reviews') || '[]');
    
    // Add default reviews if empty
    if (reviews.length === 0) {
        reviews = [
            { id: 1, user: 'Александр', rating: 5, text: 'Отличный бот! Уже заработал 3000 рублей за неделю. Оформление карты заняло 15 минут, деньги пришли через час.', date: '22.03.2024', likes: 24, dislikes: 1 },
            { id: 2, user: 'Мария', rating: 5, text: 'Очень удобное приложение. Реферальная система работает отлично, уже пригласила 3 друзей.', date: '21.03.2024', likes: 18, dislikes: 0 },
            { id: 3, user: 'Дмитрий', rating: 4, text: 'Хороший выбор предложений. Есть мелкие баги в интерфейсе, но в целом все работает.', date: '20.03.2024', likes: 12, dislikes: 2 },
            { id: 4, user: 'Елена', rating: 5, text: 'Вывод средств быстрый, на карту пришли за 1 день. Буду рекомендовать друзьям!', date: '19.03.2024', likes: 31, dislikes: 0 }
        ];
        localStorage.setItem('reviews', JSON.stringify(reviews));
    }
    
    // Sort reviews
    const sortValue = sortSelect.value;
    reviews.sort((a, b) => {
        switch(sortValue) {
            case 'newest':
                return b.id - a.id;
            case 'highest':
                return b.rating - a.rating;
            case 'lowest':
                return a.rating - b.rating;
            default:
                return b.id - a.id;
        }
    });
    
    reviewsList.innerHTML = '';
    
    reviews.forEach(review => {
        const reviewElement = document.createElement('div');
        reviewElement.className = 'review-item';
        reviewElement.innerHTML = `
            <div class="review-header">
                <div class="review-user">
                    <div class="user-avatar">${review.user.charAt(0)}</div>
                    <div class="user-info">
                        <h4>${review.user}</h4>
                        <span>${review.date}</span>
                    </div>
                </div>
                <div class="review-rating">
                    ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}
                </div>
            </div>
            <p class="review-text">${review.text}</p>
            <div class="review-footer">
                <span class="review-date">${review.date}</span>
                <div class="review-actions">
                    <button class="review-action like-btn" data-id="${review.id}">
                        <i class="fas fa-thumbs-up"></i> ${review.likes}
                    </button>
                    <button class="review-action dislike-btn" data-id="${review.id}">
                        <i class="fas fa-thumbs-down"></i> ${review.dislikes}
                    </button>
                </div>
            </div>
        `;
        
        // Add event listeners for like/dislike buttons
        const likeBtn = reviewElement.querySelector('.like-btn');
        const dislikeBtn = reviewElement.querySelector('.dislike-btn');
        
        likeBtn.addEventListener('click', () => {
            const reviewId = parseInt(likeBtn.dataset.id);
            const reviews = JSON.parse(localStorage.getItem('reviews'));
            const reviewIndex = reviews.findIndex(r => r.id === reviewId);
            
            if (reviewIndex !== -1) {
                reviews[reviewIndex].likes++;
                localStorage.setItem('reviews', JSON.stringify(reviews));
                likeBtn.innerHTML = `<i class="fas fa-thumbs-up"></i> ${reviews[reviewIndex].likes}`;
                showToast('Спасибо за вашу оценку!', 'success');
            }
        });
        
        dislikeBtn.addEventListener('click', () => {
            const reviewId = parseInt(dislikeBtn.dataset.id);
            const reviews = JSON.parse(localStorage.getItem('reviews'));
            const reviewIndex = reviews.findIndex(r => r.id === reviewId);
            
            if (reviewIndex !== -1) {
                reviews[reviewIndex].dislikes++;
                localStorage.setItem('reviews', JSON.stringify(reviews));
                dislikeBtn.innerHTML = `<i class="fas fa-thumbs-down"></i> ${reviews[reviewIndex].dislikes}`;
                showToast('Спасибо за вашу оценку!', 'success');
            }
        });
        
        reviewsList.appendChild(reviewElement);
    });
}

function updateHomeStats() {
    // Update statistics with animation
    const stats = {
        totalEarnings: 3250,
        referrals: 5,
        completedOffers: 12,
        activeDays: 7
    };
    
    animateValue('totalEarnings', 0, stats.totalEarnings, 1000);
    animateValue('referralsCount', 0, stats.referrals, 1000);
    animateValue('completedOffers', 0, stats.completedOffers, 1000);
    animateValue('activeDays', 0, stats.activeDays, 1000);
}

function updateBalance() {
    // Update balance with animation
    const balance = 1250;
    animateValue('availableBalance', 0, balance, 1000);
}

function animateValue(elementId, start, end, duration) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        element.textContent = elementId === 'totalEarnings' ? value + ' ₽' : value;
        
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Modal Functions
function showWithdrawModal() {
    const modal = document.getElementById('withdrawModal');
    const modalBody = modal.querySelector('.modal-body');
    
    modalBody.innerHTML = `
        <div class="withdraw-form">
            <div class="form-group">
                <label>Сумма вывода</label>
                <div class="amount-input">
                    <input type="number" id="withdrawAmount" placeholder="500" min="500" max="1250">
                    <span>₽</span>
                </div>
                <div class="amount-hint">Доступно: 1250 ₽</div>
            </div>
            
            <div class="form-group">
                <label>Способ получения</label>
                <div class="methods-select">
                    <div class="method-option active" data-method="card">
                        <i class="fas fa-credit-card"></i>
                        <span>Банковская карта</span>
                    </div>
                    <div class="method-option" data-method="yoomoney">
                        <i class="fas fa-wallet"></i>
                        <span>ЮMoney</span>
                    </div>
                    <div class="method-option" data-method="qiwi">
                        <i class="fas fa-mobile-alt"></i>
                        <span>QIWI Кошелек</span>
                    </div>
                </div>
            </div>
            
            <div class="form-group">
                <label>Номер карты/кошелька</label>
                <input type="text" id="withdrawAccount" placeholder="0000 0000 0000 0000">
            </div>
            
            <button class="btn-withdraw" id="confirmWithdrawBtn">Вывести средства</button>
        </div>
    `;
    
    modal.classList.add('active');
    
    // Add event listeners for the modal
    const methodOptions = modal.querySelectorAll('.method-option');
    const confirmBtn = modal.querySelector('#confirmWithdrawBtn');
    
    methodOptions.forEach(option => {
        option.addEventListener('click', () => {
            methodOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
        });
    });
    
    confirmBtn.addEventListener('click', () => {
        const amount = document.getElementById('withdrawAmount').value;
        const account = document.getElementById('withdrawAccount').value;
        
        if (!amount || amount < 500) {
            showToast('Минимальная сумма вывода - 500 ₽', 'error');
            return;
        }
        
        if (!account) {
            showToast('Введите номер карты/кошелька', 'error');
            return;
        }
        
        showToast(`Заявка на вывод ${amount} ₽ создана`, 'success');
        modal.classList.remove('active');
        
        // In production, this would be an API call
        setTimeout(() => {
            showToast('Деньги успешно выведены!', 'success');
            loadUserData();
        }, 2000);
    });
}

// Toast Notification
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Event Listeners
themeToggle.addEventListener('click', () => {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(currentTheme);
});

// Filter button for transactions
document.getElementById('filterBtn')?.addEventListener('click', () => {
    showToast('Фильтр по транзакциям скоро будет доступен', 'info');
});

// Sort reviews
document.getElementById('sortReviews')?.addEventListener('change', loadReviews);

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);