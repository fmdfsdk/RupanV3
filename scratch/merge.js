const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'untruncated_landing.html');
const destPath = path.join(__dirname, 'completed_landing.html');

try {
  const content = fs.readFileSync(srcPath, 'utf8');
  
  // Find where the footer starts and slice the file there
  const footerMarker = '<!-- FOOTER -->';
  const markerIndex = content.indexOf(footerMarker);
  if (markerIndex === -1) {
    console.error('Could not find the footer marker');
    process.exit(1);
  }
  
  const originalBody = content.substring(0, markerIndex);
  
  // Our new integrated components
  const newFooter = `
    <!-- 13. FOOTER -->
    <footer class="bg-slate-900 text-slate-400 py-12 mt-20 border-t border-slate-800">
        <div class="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="space-y-4" data-aos="fade-up">
                <h3 class="text-white text-lg font-bold">Rupan Brand</h3>
                <p class="text-xs text-slate-400 leading-relaxed">
                    প্রিমিয়াম কোয়ালিটির ফেব্রিক ও আধুনিক ডিজাইনের সমন্বয়ে তৈরি আমাদের পোশাক। আপনার স্টাইল ও আরাম আমাদের অঙ্গীকার।
                </p>
            </div>
            <div class="space-y-4" data-aos="fade-up" data-aos-delay="100">
                <h3 class="text-white text-base font-bold">যোগাযোগ</h3>
                <p class="text-xs text-slate-400">
                    <i class="fa-solid fa-phone text-brandPrimary mr-2"></i> হটলাইন: +8809612345678<br>
                    <i class="fa-solid fa-envelope text-brandPrimary mr-2"></i> ইমেইল: support@rupan.com
                </p>
            </div>
            <div class="space-y-4" data-aos="fade-up" data-aos-delay="200">
                <h3 class="text-white text-base font-bold">পলিসি সমূহ</h3>
                <ul class="text-xs space-y-2">
                    <li><a href="/policy" class="hover:text-brandPrimary transition-colors">রিটার্ন ও রিফান্ড পলিসি</a></li>
                    <li><a href="/policy" class="hover:text-brandPrimary transition-colors">প্রাইভেসি পলিসি</a></li>
                    <li><a href="/faq" class="hover:text-brandPrimary transition-colors">সচরাচর জিজ্ঞাসিত প্রশ্নাবলী</a></li>
                </ul>
            </div>
        </div>
        <div class="max-w-5xl mx-auto px-4 mt-8 pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
            &copy; 2026 Rupan Brand. All Rights Reserved. Development by Rupan Team.
        </div>
    </footer>
  `;

  const orderModal = `
    <!-- ORDER MODAL OVERLAY -->
    <div id="order-modal" class="modal-overlay fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 invisible opacity-0 transition-all duration-300">
        <!-- Modal Content Container -->
        <div class="modal-content bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden transform scale-95 transition-all duration-300 border border-slate-100 flex flex-col max-h-[90vh]">
            
            <!-- Modal Header -->
            <div class="bg-gradient-to-r from-brandPrimary to-red-600 text-white px-6 py-4 flex items-center justify-between shadow-md shrink-0">
                <h3 class="font-extrabold text-base md:text-lg flex items-center gap-2">
                    <i class="fa-solid fa-cart-shopping animate-pulse"></i>
                    <span>আপনার অর্ডারের বিবরণ দিন</span>
                </h3>
                <button onclick="closeOrderModal()" class="w-8 h-8 rounded-full bg-black/25 hover:bg-black/40 flex items-center justify-center text-white transition-colors cursor-pointer text-sm">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>

            <!-- Modal Body (Scrollable) -->
            <form id="order-form" onsubmit="handleOrderSubmit(event)" class="p-6 space-y-5 overflow-y-auto flex-1">
                
                <!-- Product Preview Section inside Modal -->
                <div class="bg-slate-50 p-4 rounded-xl border border-slate-100 flex gap-4 items-center">
                    <img id="modal-product-image" src="" alt="Selected Combo Preview" class="w-20 h-20 object-cover rounded-lg border border-slate-200 shadow-sm img-crisp">
                    <div class="space-y-1">
                        <span id="modal-product-code" class="bg-brandPrimary text-white text-[10px] font-bold px-2 py-0.5 rounded">কোড</span>
                        <h4 id="modal-product-name" class="font-extrabold text-sm md:text-base text-slate-800 leading-snug"></h4>
                        <p class="text-brandPrimary font-extrabold text-base md:text-lg"><span id="modal-product-price">৯৯০</span>৳</p>
                    </div>
                </div>

                <!-- Step 1: Combo and Size Select -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- Combo Selection -->
                    <div class="space-y-1.5">
                        <label for="modal-combo-select" class="block text-xs font-bold text-slate-700">টি-শার্ট কম্বো নির্বাচন করুন:</label>
                        <div class="relative">
                            <select id="modal-combo-select" onchange="onModalComboChange(this.value)" class="w-full bg-slate-50 border border-slate-200 text-xs md:text-sm font-semibold p-3 rounded-lg focus:ring-2 focus:ring-brandPrimary focus:border-brandPrimary outline-none">
                                <option value="4661">কম্বো সেট ১ (কোড: 4661) - ৯৯০৳</option>
                                <option value="4763">কম্বো সেট ২ (কোড: 4763) - ৯৯০৳</option>
                            </select>
                            <i class="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs"></i>
                        </div>
                    </div>

                    <!-- Size Selection -->
                    <div class="space-y-1.5">
                        <label for="modal-size-select" class="block text-xs font-bold text-slate-700">আপনার সাইজ নির্বাচন করুন:</label>
                        <div class="relative">
                            <select id="modal-size-select" required class="w-full bg-slate-50 border border-slate-200 text-xs md:text-sm font-semibold p-3 rounded-lg focus:ring-2 focus:ring-brandPrimary focus:border-brandPrimary outline-none">
                                <option value="" disabled selected>সাইজ বেছে নিন</option>
                                <option value="M">M (চেস্ট ৩৬", লম্বা ২৭")</option>
                                <option value="L">L (চেস্ট ৩৮", লম্বা ২৮")</option>
                                <option value="XL">XL (চেস্ট ৪০", লম্বা ২৯")</option>
                                <option value="XXL">XXL (চেস্ট ৪২", লম্বা ৩০")</option>
                            </select>
                            <i class="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs"></i>
                        </div>
                    </div>
                </div>

                <!-- Step 2: Shipping / Contact Information -->
                <div class="space-y-4 pt-2 border-t border-slate-100">
                    <h5 class="text-xs font-bold text-slate-500 uppercase tracking-wider">ডেলিভারি ঠিকানা ও তথ্য</h5>
                    
                    <!-- Customer Name -->
                    <div class="space-y-1.5">
                        <label for="cust-name" class="block text-xs font-bold text-slate-700">আপনার নাম:</label>
                        <div class="relative">
                            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"><i class="fa-regular fa-user"></i></span>
                            <input type="text" id="cust-name" required placeholder="যেমন: মোঃ সাকিব হাসান" class="w-full bg-slate-50 border border-slate-200 text-xs md:text-sm p-3 pl-10 rounded-lg focus:ring-2 focus:ring-brandPrimary focus:border-brandPrimary outline-none">
                        </div>
                    </div>

                    <!-- Phone Number -->
                    <div class="space-y-1.5">
                        <label for="cust-phone" class="block text-xs font-bold text-slate-700">মোবাইল নম্বর (১১ ডিজিট):</label>
                        <div class="relative">
                            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"><i class="fa-solid fa-phone"></i></span>
                            <input type="tel" id="cust-phone" pattern="^(?:\\+88|88)?(01[3-9]\\d{8})$" required placeholder="যেমন: 017XXXXXXXX" class="w-full bg-slate-50 border border-slate-200 text-xs md:text-sm p-3 pl-10 rounded-lg focus:ring-2 focus:ring-brandPrimary focus:border-brandPrimary outline-none">
                        </div>
                    </div>

                    <!-- Delivery Area -->
                    <div class="space-y-1.5">
                        <label class="block text-xs font-bold text-slate-700">ডেলিভারি এরিয়া:</label>
                        <div class="grid grid-cols-2 gap-4">
                            <label class="border-2 border-slate-200 rounded-xl p-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-all select-none">
                                <span class="flex items-center gap-2">
                                    <input type="radio" name="delivery_area" value="inside" checked onchange="updateDeliveryCosts()" class="text-brandPrimary focus:ring-brandPrimary">
                                    <span class="text-xs md:text-sm font-bold text-slate-700">ঢাকার ভেতরে</span>
                                </span>
                                <span class="text-xs font-extrabold text-brandPrimary">৬০৳</span>
                            </label>
                            <label class="border-2 border-slate-200 rounded-xl p-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-all select-none">
                                <span class="flex items-center gap-2">
                                    <input type="radio" name="delivery_area" value="outside" onchange="updateDeliveryCosts()" class="text-brandPrimary focus:ring-brandPrimary">
                                    <span class="text-xs md:text-sm font-bold text-slate-700">ঢাকার বাইরে</span>
                                </span>
                                <span class="text-xs font-extrabold text-brandPrimary">১২০৳</span>
                            </label>
                        </div>
                    </div>

                    <!-- Full Address -->
                    <div class="space-y-1.5">
                        <label for="cust-address" class="block text-xs font-bold text-slate-700">পূর্ণাঙ্গ ঠিকানা (গ্রাম, থানা, জেলা সহ):</label>
                        <div class="relative">
                            <span class="absolute left-3 top-3 text-slate-400 text-sm"><i class="fa-solid fa-location-dot"></i></span>
                            <textarea id="cust-address" required rows="2" placeholder="যেমন: হাউজ নং # ১২, রোড নং # ৪, সেক্টর # ৩, উত্তরা, ঢাকা" class="w-full bg-slate-50 border border-slate-200 text-xs md:text-sm p-3 pl-10 rounded-lg focus:ring-2 focus:ring-brandPrimary focus:border-brandPrimary outline-none resize-none"></textarea>
                        </div>
                    </div>
                </div>

                <!-- Price Summary -->
                <div class="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2 text-xs md:text-sm font-bold text-slate-700">
                    <div class="flex justify-between">
                        <span>সাবটোটাল (Subtotal):</span>
                        <span>৯৯০৳</span>
                    </div>
                    <div class="flex justify-between">
                        <span>ডেলিভারি চার্জ (Delivery):</span>
                        <span id="summary-shipping">৬০৳</span>
                    </div>
                    <div class="flex justify-between pt-2 border-t text-sm md:text-base text-brandPrimary font-black">
                        <span>সর্বমোট মূল্য (Total):</span>
                        <span id="summary-total">১০৫০৳</span>
                    </div>
                </div>

                <!-- Submit Button -->
                <button type="submit" id="btn-submit-order" class="w-full btn-ripple bg-brandSuccess hover:bg-green-700 text-white font-extrabold text-lg py-4 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer">
                    <span id="btn-submit-text">অর্ডার নিশ্চিত করুন (১০৫০৳)</span>
                    <i class="fa-solid fa-circle-check"></i>
                </button>

            </form>
        </div>
    </div>
  `;

  const scriptsAndClosing = `
    <!-- AOS Animation Library JS & Supabase JS Client -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    
    <script>
        // Initialize AOS animations
        AOS.init({
            duration: 800,
            once: true
        });

        // 1. DYNAMIC CONFIGURATION & PLACEHOLDERS
        // Note: window.SUPABASE_URL and window.SUPABASE_ANON_KEY are dynamically injected by the website server,
        // but you can also write your own credentials here directly if hosting standalone:
        const CONFIG = {
            supabaseUrl: 'RUPAN_SUPABASE_URL',
            supabaseAnonKey: 'RUPAN_SUPABASE_KEY',
            // Google Forms Integration
            googleFormUrl: 'https://docs.google.com/forms/d/e/1FAIpQLScWciPpxaE6svA-bbVBrmwiAyg8hx4ywPtZzGv-fVN50PwL4g/formResponse',
            googleFormNameEntry: 'entry.1968728851',
            googleFormPhoneEntry: 'entry.2013844334',
            googleFormAltPhoneEntry: 'entry.693010558',
            googleFormZoneEntry: 'entry.186535850',
            googleFormAddressEntry: 'entry.983211192',
            googleFormProductEntry: 'entry.1041788079',
            googleFormColorEntry: 'entry.564141370',
            googleFormQtyEntry: 'entry.1661892611',
            googleFormNotesEntry: 'entry.1757010605',
            googleFormPaymentEntry: 'entry.1062300991',
            googleFormTxnEntry: 'entry.337790140',
            googleFormPromoEntry: 'entry.518654390',

            // Telegram Bot Integration
            telegramBotToken: '8610132603:AAHmJ8soKpVbL2ZloWuCKEPb4c1b9dW8wxw',
            telegramChatId: '6532839240'
        };

        // Initialize Supabase Client
        let supabaseClient = null;
        if (CONFIG.supabaseUrl && CONFIG.supabaseAnonKey && CONFIG.supabaseUrl !== 'RUPAN_SUPABASE_URL' && CONFIG.supabaseUrl !== '') {
            try {
                supabaseClient = supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseAnonKey);
            } catch (err) {
                console.error("Failed to initialize Supabase:", err);
            }
        }

        // Product details for checkout mapping
        const PRODUCTS_MAP = {
            '4661': {
                id: '4661',
                name: 'Stylish/Comfortable Sports T-Shirt 5 pcs Combo',
                price: 990,
                color: 'Combo 4661',
                image: 'https://mohasagor.com.bd/public/storage/images/products/icUss9SlQbEFKxByLDeKGdeAv2eSpTzS5XgysHHn.jpg'
            },
            '4763': {
                id: '4763',
                name: '5 pcs Sports T-Shirt Combo',
                price: 990,
                color: 'Combo 4763',
                image: 'https://mohasagor.com.bd/public/storage/images/products/wHJDs8v5tIWOlnUGeZKPm6uUHtLN8TwgiXGGRTCH.png'
            }
        };

        // Active State
        let activeCombo = '4661';

        // 2. COUNTDOWN TIMER
        let timeRemaining = 15 * 60; // 15 minutes in seconds
        const timerDisplay = document.getElementById('timer-display');
        if (timerDisplay) {
            const timerInterval = setInterval(() => {
                const minutes = Math.floor(timeRemaining / 60);
                const seconds = timeRemaining % 60;
                timerDisplay.textContent = \`\${minutes.toString().padStart(2, '0')}:\${seconds.toString().padStart(2, '0')}\`;
                if (timeRemaining <= 0) {
                    clearInterval(timerInterval);
                } else {
                    timeRemaining--;
                }
            }, 1000);
        }

        // 3. PRODUCT IMAGES DATA & HERO GALLERY
        const GALLERY_IMAGES = {
            '4661': [
                'https://mohasagor.com.bd/public/storage/images/products/icUss9SlQbEFKxByLDeKGdeAv2eSpTzS5XgysHHn.jpg',
                'https://mohasagor.com.bd/public/storage/images/products/B0cVaH0kRDLGyWAx7hmo3ywfCwanrE0cotQQjgDZ.jpg',
                'https://mohasagor.com.bd/public/storage/images/products/FqsTJLOAsbIwBS5jOdJSkzrxSBxIB4jkR7Ha4aOa.jpg',
                'https://mohasagor.com.bd/public/storage/images/products/WzVl5PLVtWWn4Z7KHNmG9ID74Zi5XKnBBguP71HL.jpg',
                'https://mohasagor.com.bd/public/storage/images/products/JnIOxFevIbmePscySdJViCFDHsvqDM6GH8E1pZWW.jpg',
                'https://mohasagor.com.bd/public/storage/images/products/tbg9yCKaLl4BMVbn4huPDCMhTktNZJzGUkQpV2Xu.jpg',
                'https://mohasagor.com.bd/public/storage/images/products/lqbRoUFQ73aKxJi7d7qpf1tKjjIScUqe1RAL1qkp.jpg'
            ],
            '4763': [
                'https://mohasagor.com.bd/public/storage/images/products/wHJDs8v5tIWOlnUGeZKPm6uUHtLN8TwgiXGGRTCH.png',
                'https://mohasagor.com.bd/public/storage/images/products/SvWLpQeMq3DDZHjoPBfj75TsdU4KyXUy8z28Celp.jpg',
                'https://mohasagor.com.bd/public/storage/images/products/Uf0wlwsCYwymF7WIT9PmDT3U4i6fls3HHv3VN0ya.jpg',
                'https://mohasagor.com.bd/public/storage/images/products/kXyPinVYpyM6OQJRFuigXjY7LvkcOsBd5IcC1rgA.jpg',
                'https://mohasagor.com.bd/public/storage/images/products/rva9Ub5fBBE2GeNMMCuO9gbY17ltJkvDn5HnXpKv.jpg'
            ]
        };

        function renderGalleryThumbnails(comboCode) {
            const container = document.getElementById('gallery-thumbnails');
            if (!container) return;
            container.innerHTML = '';
            
            const images = GALLERY_IMAGES[comboCode];
            images.forEach((imgUrl, idx) => {
                const thumb = document.createElement('button');
                thumb.className = \`w-14 h-14 rounded-lg overflow-hidden border-2 shrink-0 transition-all \${idx === 0 ? 'border-brandPrimary' : 'border-transparent'}\`;
                thumb.onclick = () => {
                    document.getElementById('main-product-image').src = imgUrl;
                    // Reset all borders
                    Array.from(container.children).forEach(el => el.classList.remove('border-brandPrimary'));
                    thumb.classList.add('border-brandPrimary');
                };
                thumb.innerHTML = \`<img src="\${imgUrl}" class="w-full h-full object-cover img-crisp">\`;
                container.appendChild(thumb);
            });
        }

        // Initialize first gallery
        renderGalleryThumbnails(activeCombo);

        // 4. COMBO SELECTOR FUNCTIONS
        function selectCombo(comboCode) {
            activeCombo = comboCode;
            
            // Sync radio button
            const radio = document.getElementById(\`combo-radio-\${comboCode}\`);
            if (radio) radio.checked = true;

            // Sync visual cards selection classes
            ['4661', '4763'].forEach(code => {
                const card = document.getElementById(\`card-combo-\${code}\`);
                if (code === comboCode) {
                    card.classList.add('border-brandPrimary', 'bg-red-50/30');
                    card.classList.remove('border-slate-200', 'bg-white');
                } else {
                    card.classList.add('border-slate-200', 'bg-white');
                    card.classList.remove('border-brandPrimary', 'bg-red-50/30');
                }
            });

            // Update main title and details in Hero
            const prod = PRODUCTS_MAP[comboCode];
            document.getElementById('hero-title').textContent = prod.name;
            document.getElementById('main-product-image').src = prod.image;
            document.getElementById('hero-offer-price').textContent = prod.price;

            // Rerender Thumbnails
            renderGalleryThumbnails(comboCode);

            // Track InitiateCheckout / Option change
            trackMarketingEvent('InitiateCheckout', {
                content_ids: [prod.id],
                content_type: 'product',
                value: prod.price,
                currency: 'BDT'
            });
        }

        function quickOrderCombo(comboCode) {
            selectCombo(comboCode);
            openOrderModal();
        }

        // 5. ACCORDION (FAQ) TOGGLE
        function toggleFaq(id) {
            const ans = document.getElementById(\`faq-ans-\${id}\`);
            const icon = document.getElementById(\`faq-icon-\${id}\`);
            if (ans.classList.contains('hidden')) {
                ans.classList.remove('hidden');
                icon.classList.add('rotate-180');
            } else {
                ans.classList.add('hidden');
                icon.classList.remove('rotate-180');
            }
        }

        // 6. ORDER MODAL LOGIC
        function openOrderModal() {
            const modal = document.getElementById('order-modal');
            const content = modal.querySelector('.modal-content');
            
            // Set values inside modal based on active combo selection
            onModalComboChange(activeCombo);

            // Show modal
            modal.classList.remove('invisible', 'opacity-0');
            content.classList.remove('scale-95');
            content.classList.add('scale-100');

            // Track InitiateCheckout
            const prod = PRODUCTS_MAP[activeCombo];
            trackMarketingEvent('InitiateCheckout', {
                content_ids: [prod.id],
                content_type: 'product',
                value: prod.price,
                currency: 'BDT'
            });
        }

        function closeOrderModal() {
            const modal = document.getElementById('order-modal');
            const content = modal.querySelector('.modal-content');
            
            // Hide modal
            modal.classList.add('invisible', 'opacity-0');
            content.classList.remove('scale-100');
            content.classList.add('scale-95');
        }

        function onModalComboChange(comboCode) {
            activeCombo = comboCode;
            document.getElementById('modal-combo-select').value = comboCode;
            
            // Update modal preview details
            const prod = PRODUCTS_MAP[comboCode];
            document.getElementById('modal-product-image').src = prod.image;
            document.getElementById('modal-product-code').textContent = \`কোড: \${prod.id}\`;
            document.getElementById('modal-product-name').textContent = prod.name;
            document.getElementById('modal-product-price').textContent = prod.price;

            // Sync selectors in main layout
            const radio = document.getElementById(\`combo-radio-\${comboCode}\`);
            if (radio) radio.checked = true;
            selectCombo(comboCode);

            updateDeliveryCosts();
        }

        function updateDeliveryCosts() {
            const prod = PRODUCTS_MAP[activeCombo];
            const area = document.querySelector('input[name="delivery_area"]:checked').value;
            
            // Standard shipping calculations (Inside: 60, Outside: 120)
            const shippingFee = area === 'inside' ? 60 : 120;
            const total = prod.price + shippingFee;

            // Update UI fields
            document.getElementById('summary-shipping').textContent = \`\${shippingFee}৳\`;
            document.getElementById('summary-total').textContent = \`\${total}৳\`;
            document.getElementById('btn-submit-text').textContent = \`অর্ডার নিশ্চিত করুন (\${total}৳)\`;
        }

        // Generate dynamic unique order ID
        function generateOrderId() {
            const prefix = "RUP";
            const ts = Date.now().toString().slice(-6);
            const rand = Math.floor(1000 + Math.random() * 9000);
            return \`\${prefix}-\${ts}-\${rand}\`;
        }

        // Generate Event ID for Pixel deduplication
        function generateEventId(eventName) {
            const ts = Date.now();
            const rnd = Math.floor(100000 + Math.random() * 900000);
            return \`evt-\${eventName.toLowerCase()}-\${ts}-\${rnd}\`;
        }

        // 7. ORDER SUBMISSION HANDLER
        async function handleOrderSubmit(e) {
            e.preventDefault();

            // Disable submit button during processing
            const btnSubmit = document.getElementById('btn-submit-order');
            const originalBtnText = btnSubmit.innerHTML;
            btnSubmit.disabled = true;
            btnSubmit.innerHTML = \`<i class="fa-solid fa-spinner animate-spin text-xl mr-2"></i> অর্ডার প্রসেস হচ্ছে...\`;

            // Retrieve Form Values
            const name = document.getElementById('cust-name').value.trim();
            const phone = document.getElementById('cust-phone').value.trim();
            const address = document.getElementById('cust-address').value.trim();
            const area = document.querySelector('input[name="delivery_area"]:checked').value === 'inside' ? 'Inside Dhaka' : 'Outside Dhaka';
            const selectedSize = document.getElementById('modal-size-select').value;
            const product = PRODUCTS_MAP[activeCombo];

            const shippingFee = area === 'Inside Dhaka' ? 60 : 120;
            const total = product.price + shippingFee;
            const orderId = generateOrderId();
            const metaEventId = generateEventId('Purchase');

            // Format items array exactly matching website format
            const items = [{
                productId: product.id,
                productName: product.name,
                color: product.color,
                size: selectedSize,
                price: product.price,
                quantity: 1,
                image: product.image
            }];

            let dbSuccess = false;

            // 1. SAVE TO DATABASE (Supabase)
            if (supabaseClient) {
                try {
                    // Save to orders table
                    const { error: orderError } = await supabaseClient.from('orders').insert([{
                        id: orderId,
                        customer_name: name,
                        phone: phone,
                        address: address,
                        area: area,
                        payment_method: 'COD',
                        items: items,
                        subtotal: product.price,
                        shipping_fee: shippingFee,
                        total: total,
                        status: 'Pending',
                        payment_status: 'Unpaid',
                        customer_notes: \`Size: \${selectedSize} (Landing Page Order)\`,
                        meta_event_id: metaEventId,
                        is_guest: true
                    }]);

                    if (orderError) throw orderError;

                    // Save to order_items table (mirrors productService items tracking)
                    const orderItems = [{
                        orderId: orderId,
                        productId: product.id,
                        productName: product.name,
                        color: product.color,
                        size: selectedSize,
                        price: product.price,
                        quantity: 1,
                        image: product.image
                    }];
                    
                    // We fire this and ignore if table doesn't exist
                    await supabaseClient.from('order_items').insert(orderItems);
                    
                    dbSuccess = true;
                    console.log("Order saved to database successfully! Order ID:", orderId);
                } catch (err) {
                    console.error("Failed to save order to Supabase database:", err.message);
                }
            } else {
                console.warn("Supabase client not initialized, skipping database sync. Make sure credentials are set.");
            }

            // 2. SUBMIT TO GOOGLE FORM
            if (CONFIG.googleFormUrl && CONFIG.googleFormUrl.trim() !== '') {
                try {
                    const formData = new URLSearchParams();
                    formData.append(CONFIG.googleFormNameEntry, name);
                    formData.append(CONFIG.googleFormPhoneEntry, phone);
                    formData.append(CONFIG.googleFormAltPhoneEntry, '');
                    formData.append(CONFIG.googleFormZoneEntry, area);
                    formData.append(CONFIG.googleFormAddressEntry, address);
                    formData.append(CONFIG.googleFormProductEntry, product.name + " (Code: " + product.id + ")");
                    formData.append(CONFIG.googleFormColorEntry, product.color);
                    formData.append(CONFIG.googleFormQtyEntry, '1');
                    formData.append(CONFIG.googleFormNotesEntry, "Size: " + selectedSize);
                    formData.append(CONFIG.googleFormPaymentEntry, 'COD');
                    formData.append(CONFIG.googleFormTxnEntry, orderId);
                    formData.append(CONFIG.googleFormPromoEntry, '');

                    // Use no-cors mode to bypass CORS errors when posting directly
                    await fetch(CONFIG.googleFormUrl, {
                        method: 'POST',
                        mode: 'no-cors',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        body: formData.toString()
                    });
                    console.log("Order submitted to Google Forms!");
                } catch (err) {
                    console.error("Failed to post to Google Form:", err);
                }
            }

            // 3. SEND TELEGRAM MESSAGE
            if (CONFIG.telegramBotToken && CONFIG.telegramChatId && CONFIG.telegramBotToken !== 'YOUR_TELEGRAM_BOT_TOKEN') {
                try {
                    const tgText = "<b>🔔 নতুন ল্যান্ডিং পেজ অর্ডার!</b>\\n\\n" +
                                   "<b>🆔 অর্ডার আইডি:</b> " + orderId + "\\n" +
                                   "<b>👤 নাম:</b> " + name + "\\n" +
                                   "<b>📞 ফোন:</b> " + phone + "\\n" +
                                   "<b>📍 ঠিকানা:</b> " + address + "\\n" +
                                   "<b>🚚 এরিয়া:</b> " + area + "\\n" +
                                   "<b>📦 পণ্য:</b> " + product.name + " (Code: " + product.id + ")\\n" +
                                   "<b>📏 সাইজ:</b> " + selectedSize + "\\n" +
                                   "<b>💵 সাবটোটাল:</b> " + product.price + "৳\\n" +
                                   "<b>🚚 ডেলিভারি:</b> " + shippingFee + "৳\\n" +
                                   "<b>💰 সর্বমোট:</b> " + total + "৳\\n" +
                                   "<b>🕒 সময়:</b> " + new Date().toLocaleString('bn-BD');

                    await fetch(\`https://api.telegram.org/bot\${CONFIG.telegramBotToken}/sendMessage\`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            chat_id: CONFIG.telegramChatId,
                            text: tgText,
                            parse_mode: 'HTML'
                        })
                    });
                    console.log("Order sent to Telegram channel!");
                } catch (err) {
                    console.error("Failed to send Telegram bot alert:", err);
                }
            }

            // 4. FIRE MARKETING EVENTS (PageView, Purchase, etc.)
            const purchasePayload = {
                content_ids: [product.id],
                content_type: 'product',
                value: total,
                currency: 'BDT',
                num_items: 1,
                order_id: orderId,
                payment_method: 'COD',
                shipping_fee: shippingFee,
                contents: [{
                    id: product.id,
                    quantity: 1,
                    item_price: product.price,
                    size: selectedSize,
                    color: product.color
                }]
            };

            // Trigger Facebook Pixel Browser & Server-side CAPI events
            trackMarketingEvent('Purchase', purchasePayload, metaEventId, { phone, name });

            // Show Success view inside the modal instead of redirecting
            const modalForm = document.getElementById('order-form');
            if (modalForm) {
                // Remove header close button to keep success view clean and guide click to home
                const modalHeaderBtn = document.querySelector('#order-modal button');
                if (modalHeaderBtn) modalHeaderBtn.remove();
                
                modalForm.innerHTML = 
                    '<div class="text-center py-8 px-4 space-y-5 animate-in fade-in zoom-in-95 duration-300">' +
                        '<div class="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-3xl shadow-sm border border-green-200">' +
                            '<i class="fa-solid fa-circle-check animate-bounce"></i>' +
                        '</div>' +
                        '<div class="space-y-1.5">' +
                            '<h3 class="text-xl font-black text-slate-800">ধন্যবাদ! আপনার অর্ডারটি সফল হয়েছে।</h3>' +
                            '<p class="text-xs text-slate-500 font-bold">অর্ডার আইডি: <span class="font-mono text-slate-700 font-extrabold">' + orderId + '</span></p>' +
                            '<p class="text-[11px] text-slate-500 font-semibold leading-relaxed">আমাদের একজন প্রতিনিধি শীঘ্রই আপনার নম্বরে কল দিয়ে অর্ডারটি কনফার্ম করবেন।</p>' +
                        '</div>' +
                        '<div class="pt-3">' +
                            '<a href="/" class="w-full inline-flex items-center justify-center gap-2 bg-brandPrimary hover:bg-red-700 text-white font-extrabold text-sm py-3 px-8 rounded-xl shadow-md transition-all cursor-pointer">' +
                                '<span>আরও পণ্য দেখুন</span>' +
                                '<i class="fa-solid fa-arrow-right"></i>' +
                            '</a>' +
                        '</div>' +
                    '</div>';
            }
        }

        // 8. TELEMETRY / EVENT TRACKING WRAPPER
        function trackMarketingEvent(eventName, payload, eventId = null, userData = null) {
            const evId = eventId || generateEventId(eventName);
            
            // 1. Browser Pixel Track
            if (window.fbq) {
                window.fbq('track', eventName, payload, { eventID: evId });
            }

            // 2. Google Analytics 4 Track
            if (window.gtag) {
                const gaEvent = eventName === 'PageView' ? 'page_view' : eventName;
                window.gtag('event', gaEvent, payload);
            }

            // 3. GTM dataLayer push
            if (window.dataLayer) {
                window.dataLayer.push({ event: eventName, eventId: evId, ...payload });
            }

            // 4. Server-Side CAPI Track via /api/meta-capi
            const capId = 'RUPAN_META_PIXEL_ID';
            const capToken = 'RUPAN_META_CAPI_TOKEN';
            const capTest = 'RUPAN_META_TEST_CODE';

            if (capId && capToken && capId !== 'RUPAN_META_PIXEL_ID' && capToken !== 'RUPAN_META_CAPI_TOKEN' && capId !== '' && capToken !== '') {
                const fbp = document.cookie.match(/(^|;\\s*)_fbp=([^;]*)/)?.[2];
                const fbc = document.cookie.match(/(^|;\\s*)_fbc=([^;]*)/)?.[2];

                const capiPayload = {
                    pixelId: capId,
                    accessToken: capToken,
                    testEventCode: (capTest && capTest !== 'RUPAN_META_TEST_CODE' && capTest !== '') ? capTest : undefined,
                    events: [{
                        eventName: eventName,
                        eventId: evId,
                        eventTime: Math.floor(Date.now() / 1000),
                        eventSourceUrl: window.location.href,
                        userData: {
                            phone: userData?.phone || undefined,
                            firstName: userData?.name ? userData.name.split(' ')[0] : undefined,
                            lastName: userData?.name ? userData.name.split(' ').slice(1).join(' ') : undefined,
                            fbp: fbp || undefined,
                            fbc: fbc || undefined,
                            clientUserAgent: navigator.userAgent
                        },
                        customData: payload
                    }]
                };

                fetch('/api/meta-capi', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(capiPayload)
                }).catch(err => console.error("CAPI dispatch failed:", err));
            }
        }

        // Fire PageView event on Load
        window.addEventListener('DOMContentLoaded', () => {
            trackMarketingEvent('PageView', { page_path: window.location.pathname });
        });

    </script>
</body>
</html>
  `;

  const metadataComments = `<!-- layout: blank -->\n<!-- metadata: {"seoEnabled": true, "marketingEnabled": true} -->\n`;
  
  const headTrackingScripts = `
    <!-- Google Tag Manager -->
    <script>
      const rGtmId = 'RUPAN_GTM_ID';
      if (rGtmId && rGtmId !== 'RUPAN_GTM_ID' && rGtmId.trim() !== '') {
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer',rGtmId);
      }
    </script>
    <!-- End Google Tag Manager -->

    <!-- Google Analytics (gtag.js) -->
    <script>
      const rGaId = 'RUPAN_GA4_ID';
      if (rGaId && rGaId !== 'RUPAN_GA4_ID' && rGaId.trim() !== '') {
          var gaScript = document.createElement('script');
          gaScript.async = true;
          gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + rGaId;
          document.head.appendChild(gaScript);
          
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', rGaId);
      }
    </script>
    <!-- End Google Analytics (gtag.js) -->
  `;

  let modifiedBody = originalBody.replace('</head>', headTrackingScripts + '\n</head>');
  
  // Initialize user's existing Pixel script block
  modifiedBody = modifiedBody.replace(
    /'https:\/\/connect\.facebook\.net\/en_US\/fbevents\.js'\);/,
    `'https://connect.facebook.net/en_US/fbevents.js');\n      fbq('init', 'RUPAN_META_PIXEL_ID');\n      fbq('track', 'PageView');`
  );

  // Inject GTM noscript in body opening
  const bodyNoscripts = `
    <!-- Google Tag Manager (noscript) -->
    <noscript>
      <iframe id="gtm-noscript" src="" height="0" width="0" style="display:none;visibility:hidden"></iframe>
    </noscript>
    <script>
      const rGtmIdNoscript = 'RUPAN_GTM_ID';
      if (rGtmIdNoscript && rGtmIdNoscript !== 'RUPAN_GTM_ID' && rGtmIdNoscript.trim() !== '') {
          document.getElementById('gtm-noscript').src = 'https://www.googletagmanager.com/ns.html?id=' + rGtmIdNoscript;
      }
    </script>
  `;
  
  const bodyTagIndex = modifiedBody.search(/<body[^>]*>/i);
  if (bodyTagIndex !== -1) {
    const bodyTagMatch = modifiedBody.match(/<body[^>]*>/i)[0];
    modifiedBody = modifiedBody.replace(bodyTagMatch, bodyTagMatch + '\n' + bodyNoscripts);
  }
  
  const finalHtml = metadataComments + modifiedBody + newFooter + orderModal + scriptsAndClosing;
  fs.writeFileSync(destPath, finalHtml, 'utf8');
  console.log('Successfully completed and merged landing page HTML!');
} catch (e) {
  console.error('Error merging:', e);
}
