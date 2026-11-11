document.addEventListener('DOMContentLoaded', () => {
    const orderForm = document.getElementById('orderForm');
    if (!orderForm) return;

    const orderName = document.getElementById('orderName');
    const orderEmail = document.getElementById('orderEmail');
    const orderPhone = document.getElementById('orderPhone');
    const orderPay = document.getElementById('orderPay');
    const orderService = document.getElementById('orderService');
    const orderFormat = document.getElementById('orderFormat');
    const orderChars = document.getElementById('orderChars');
    const orderLang = document.getElementById('orderLang');
    const orderLink = document.getElementById('orderLink');
    const orderComment = document.getElementById('orderComment');
    const orderEstimate = document.getElementById('orderEstimate');
    const orderStatus = document.getElementById('orderStatus');
    const orderStatusText = orderStatus ? orderStatus.querySelector('span') : null;
    const orderSubmit = document.getElementById('orderSubmit');
    const orderSuccess = document.getElementById('orderSuccess');
    const orderSuccessText = document.getElementById('orderSuccessText');

    function showError(msg) {
        if (!orderStatus || !orderStatusText) return;
        orderStatusText.textContent = msg;
        orderStatus.classList.remove('hidden');
    }

    orderForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (orderStatus) orderStatus.classList.add('hidden');

        const name = orderName.value.trim();
        const email = orderEmail.value.trim();
        const chars = parseInt(orderChars.value, 10) || 0;

        if (name.length < 2) return showError('Укажите ваше имя.');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showError('Введите корректный Email.');

        const payload = {
            name,
            email,
            phone: orderPhone ? orderPhone.value.trim() : '',
            pay: orderPay ? orderPay.value : '',
            service: orderService ? orderService.value : '',
            format: orderFormat ? orderFormat.value : '',
            chars,
            lang: orderLang ? orderLang.value : '',
            link: orderLink ? orderLink.value.trim() : '',
            comment: orderComment ? orderComment.value.trim() : '',
            estimate: orderEstimate ? orderEstimate.textContent.trim() : '—'
        };

        if (orderSubmit) orderSubmit.disabled = true;

        try {
            if (window.AppAPI && typeof window.AppAPI.submitOrder === 'function') {
                await window.AppAPI.submitOrder(payload);
            } else {
                const orders = JSON.parse(localStorage.getItem('mirror_translator_orders') || '[]');
                orders.push({ id: 'ORD-' + Date.now().toString().slice(-6), date: new Date().toISOString(), status: 'Новая', ...payload });
                localStorage.setItem('mirror_translator_orders', JSON.stringify(orders));
            }
            orderForm.classList.add('hidden');
            if (orderSuccess) {
                if (orderSuccessText) orderSuccessText.textContent = `${name}, заявка принята! Ответим на ${email} в течение 30 минут.`;
                orderSuccess.classList.remove('hidden');
            }
        } catch (err) {
            showError(err.message || 'Ошибка при отправке заявки.');
        } finally {
            if (orderSubmit) orderSubmit.disabled = false;
        }
    });
});