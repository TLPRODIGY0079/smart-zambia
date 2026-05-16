/**
 * js/wallet.js
 * Logic for Kwacha Wallet and Mobile Money Withdrawals
 */

window.Wallet = {
    openModal() {
        const modal = document.getElementById('walletModal');
        const balanceEl = document.getElementById('modalWalletBalance');
        
        if (!window.state.isLoggedIn) {
            showToast('Please login to access your wallet', 'warning');
            return;
        }

        balanceEl.textContent = window.state.cashEarned || 0;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    },

    closeModal() {
        document.getElementById('walletModal').classList.remove('active');
        document.body.style.overflow = '';
    },

    handleWithdrawal(event) {
        event.preventDefault();
        
        const amount = parseFloat(document.getElementById('withdrawAmount').value);
        const phone = document.getElementById('withdrawPhone').value;
        const method = document.getElementById('withdrawMethod').value;
        const currentBalance = window.state.cashEarned || 0;

        if (amount < 50) {
            showToast('Minimum withdrawal is K50', 'error');
            return;
        }

        if (amount > currentBalance) {
            showToast('Insufficient balance', 'error');
            return;
        }

        // Mock processing
        const btn = event.target.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Processing...';

        setTimeout(() => {
            window.state.cashEarned -= amount;
            
            // Record transaction
            if (!window.state.transactions) window.state.transactions = [];
            window.state.transactions.unshift({
                id: Date.now(),
                type: 'withdrawal',
                amount: amount,
                method: method.toUpperCase(),
                phone: phone,
                status: 'completed',
                timestamp: new Date().toISOString()
            });

            // Persist
            if (window.saveUserData) window.saveUserData();
            
            // Update UI
            document.getElementById('profileCash').textContent = window.state.cashEarned;
            document.getElementById('profileCashBig').textContent = window.state.cashEarned;

            // Refresh Transaction History UI
            if (window.renderTransactions) window.renderTransactions();
            
            this.closeModal();
            showAchievementToast('Withdrawal Success!', `K${amount} sent to ${phone} via ${method.toUpperCase()}`);
            
            btn.disabled = false;
            btn.innerHTML = originalText;
        }, 2000);
    }
};