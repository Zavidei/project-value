class CurrencyExchange {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.apiUrl = 'https://api.exchangerate-api.com/v4/latest/';
    }

    async getRates(baseCurrency) {
        const response = await fetch(`${this.apiUrl}${baseCurrency}`);
        if (!response.ok) {
            throw new Error('Failed to fetch exchange rates.');
        }
        const data = await response.json();
        return data.rates;
    }

    async convertCurrency(from, to, amount) {
        const rates = await this.getRates(from);
        const rate = rates[to];
        if (!rate) {
            throw new Error('Invalid currency conversion.');
        }
        return (amount * rate).toFixed(2);
    }
}

class App {
    constructor() {
        this.exchange = new CurrencyExchange('807fb7b5e0a0cb99450035a0ad830996');
        this.form = document.getElementById('exchange-form');
        this.fromCurrency = document.getElementById('from-currency');
        this.toCurrency = document.getElementById('to-currency');
        this.amount = document.getElementById('amount');
        this.result = document.getElementById('conversion-result');

        this.bulkButton = document.getElementById('bulk-convert');
        this.historicalButton = document.getElementById('historical-rates');
        this.feeInput = document.getElementById('fee');
        this.convertWithFeeButton = document.getElementById('convert-with-fee');

        this.init();
    }

    async init() {
        try {
            const rates = await this.exchange.getRates('USD');
            this.populateCurrencyOptions(Object.keys(rates));
            this.addEventListeners();
        } catch (error) {
            this.result.textContent = `Error: ${error.message}`;
        }
    }

    populateCurrencyOptions(currencies) {
        currencies.forEach(currency => {
            const optionFrom = document.createElement('option');
            const optionTo = document.createElement('option');
            optionFrom.value = currency;
            optionFrom.textContent = currency;
            optionTo.value = currency;
            optionTo.textContent = currency;

            this.fromCurrency.appendChild(optionFrom);
            this.toCurrency.appendChild(optionTo);
        });
    }

    addEventListeners() {
         // Обработчик для кнопки сохранения
    document.getElementById('save-data').addEventListener('click', () => {
        const data = {
            fromCurrency: this.fromCurrency.value,
            toCurrency: this.toCurrency.value,
            amount: this.amount.value,
            fee: this.feeInput.value,
        };
        localStorage.setItem('currencyExchangeData', JSON.stringify(data));
        alert('Data saved successfully!');
    });

    // Обработчик для кнопки открытия
    document.getElementById('load-data').addEventListener('click', () => {
        const savedData = localStorage.getItem('currencyExchangeData');
        if (!savedData) {
            alert('No saved data found!');
            return;
        }
        const data = JSON.parse(savedData);
        this.fromCurrency.value = data.fromCurrency;
        this.toCurrency.value = data.toCurrency;
        this.amount.value = data.amount;
        this.feeInput.value = data.fee;
        alert('Data loaded successfully!');
    });

    // Обработчик для кнопки закрытия
    document.getElementById('close-app').addEventListener('click', () => {
        if (confirm('Are you sure you want to close the app? Unsaved data will be lost.')) {
            window.close();
        }
    });
        // Конвертация валюты
        this.form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const from = this.fromCurrency.value;
            const to = this.toCurrency.value;
            const amount = parseFloat(this.amount.value);

            if (!from || !to || !amount || amount <= 0) {
                this.result.textContent = 'Please enter valid data.';
                return;
            }

            try {
                const convertedAmount = await this.exchange.convertCurrency(from, to, amount);
                this.result.textContent = `${amount} ${from} = ${convertedAmount} ${to}`;
            } catch (error) {
                this.result.textContent = `Error: ${error.message}`;
            }
        });

        // Bulk Conversion
        this.bulkButton.addEventListener('click', async () => {
            const from = this.fromCurrency.value;
            const amount = parseFloat(this.amount.value);

            if (!from || !amount || amount <= 0) {
                this.result.textContent = 'Please enter valid data.';
                return;
            }

            try {
                const rates = await this.exchange.getRates(from);
                const results = Object.keys(rates).map(
                    to => `${to}: ${(amount * rates[to]).toFixed(2)}`
                ).join('\n');
                alert(`Converted Amounts:\n${results}`);
            } catch (error) {
                alert(`Error: ${error.message}`);
            }
        });

        // Historical Rates
        this.historicalButton.addEventListener('click', async () => {
            const from = this.fromCurrency.value;

            if (!from) {
                this.result.textContent = 'Please select a currency.';
                return;
            }

            const date = prompt('Enter a date (YYYY-MM-DD):');
            if (!date) return;

            try {
                const response = await fetch(
                    `https://open.er-api.com/v6/latest/${from}?date=${date}&apikey=${this.exchange.apiKey}`
                );
                const data = await response.json();
                if (data.error) throw new Error(data.error);

                const rates = data.rates;
                const results = Object.keys(rates).map(
                    to => `${to}: ${rates[to]}`
                ).join('\n');
                alert(`Exchange Rates on ${date}:\n${results}`);
            } catch (error) {
                alert(`Error: ${error.message}`);
            }
        });

        // Convert with Fee
        this.convertWithFeeButton.addEventListener('click', async () => {
            const from = this.fromCurrency.value;
            const to = this.toCurrency.value;
            const amount = parseFloat(this.amount.value);
            const fee = parseFloat(this.feeInput.value);

            if (!from || !to || !amount || amount <= 0 || fee < 0) {
                this.result.textContent = 'Please enter valid data.';
                return;
            }

            try {
                const convertedAmount = await this.exchange.convertCurrency(from, to, amount);
                const finalAmount = convertedAmount - (convertedAmount * (fee / 100));
                this.result.textContent = `${amount} ${from} = ${finalAmount.toFixed(2)} ${to} (after ${fee}% fee)`;
            } catch (error) {
                this.result.textContent = `Error: ${error.message}`;
            }
        });
    }
}

new App();
