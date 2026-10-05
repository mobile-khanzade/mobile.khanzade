
import os
import sqlite3
from datetime import datetime
from aiogram import Bot, Dispatcher, F
from aiogram.filters import CommandStart, Command
from aiogram.types import Message, CallbackQuery, InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.fsm.state import State, StatesGroup
from aiogram.fsm.context import FSMContext
from aiogram.fsm.storage.memory import MemoryStorage
import asyncio

BOT_TOKEN = os.getenv("BOT_TOKEN", "PUT_YOUR_BOT_TOKEN_HERE")
ADMIN_ID = int(os.getenv("ADMIN_ID", "0"))

CARD_NUMBER = "6219861968387992"
CARD_OWNER = "سعید خانزاده"

PRODUCTS = {
    "20": {"name": "20 گیگ | 31 روزه", "price": 100_000},
    "30": {"name": "30 گیگ | 30 روزه", "price": 140_000},
    "50": {"name": "50 گیگ | 30 روزه", "price": 200_000},
    "100": {"name": "100 گیگ | 31 روزه", "price": 350_000},
}

db = sqlite3.connect("bot.db")
db.execute("""CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    username TEXT,
    product_key TEXT,
    product_name TEXT,
    price INTEGER,
    receipt_file_id TEXT,
    status TEXT DEFAULT 'pending',
    config TEXT,
    created_at TEXT
)""")
db.commit()

bot = Bot(BOT_TOKEN)
dp = Dispatcher(storage=MemoryStorage())

class OrderState(StatesGroup):
    waiting_receipt = State()
    waiting_config = State()

def main_kb():
    return InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🛒 خرید کانفیگ", callback_data="buy")],
        [InlineKeyboardButton(text="📦 سفارش‌های من", callback_data="orders")],
        [InlineKeyboardButton(text="💳 اطلاعات پرداخت", callback_data="payment")],
        [InlineKeyboardButton(text="📞 پشتیبانی", callback_data="support")],
    ])

def products_kb():
    rows = []
    for key, p in PRODUCTS.items():
        rows.append([InlineKeyboardButton(
            text=f"{p['name']} — {p['price']:,} تومان",
            callback_data=f"product:{key}"
        )])
    rows.append([InlineKeyboardButton(text="🔙 بازگشت", callback_data="home")])
    return InlineKeyboardMarkup(inline_keyboard=rows)

def admin_kb(order_id):
    return InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="✅ تأیید پرداخت", callback_data=f"approve:{order_id}"),
            InlineKeyboardButton(text="❌ رد پرداخت", callback_data=f"reject:{order_id}")
        ]
    ])

@dp.message(CommandStart())
async def start(message: Message):
    await message.answer(
        "سلام 👋\n"
        "به <b>Khan V2ray</b> خوش اومدی.\n\n"
        "برای خرید کانفیگ از منوی زیر استفاده کن.",
        reply_markup=main_kb(),
        parse_mode="HTML"
    )

@dp.callback_query(F.data == "home")
async def home(call: CallbackQuery):
    await call.message.edit_text("منوی اصلی:", reply_markup=main_kb())
    await call.answer()

@dp.callback_query(F.data == "buy")
async def buy(call: CallbackQuery):
    await call.message.edit_text("📦 پلن موردنظرت رو انتخاب کن:", reply_markup=products_kb())
    await call.answer()

@dp.callback_query(F.data.startswith("product:"))
async def product(call: CallbackQuery, state: FSMContext):
    key = call.data.split(":")[1]
    p = PRODUCTS[key]
    await state.update_data(product_key=key)
    await state.set_state(OrderState.waiting_receipt)
    await call.message.answer(
        f"🛒 <b>{p['name']}</b>\n"
        f"💰 مبلغ: <b>{p['price']:,} تومان</b>\n\n"
        f"💳 شماره کارت:\n<code>{CARD_NUMBER}</code>\n"
        f"👤 به نام: <b>{CARD_OWNER}</b>\n\n"
        "بعد از کارت‌به‌کارت، عکس رسید پرداخت را همینجا ارسال کن.",
        parse_mode="HTML"
    )
    await call.answer()

@dp.message(OrderState.waiting_receipt, F.photo)
async def receipt(message: Message, state: FSMContext):
    data = await state.get_data()
    key = data["product_key"]
    p = PRODUCTS[key]
    file_id = message.photo[-1].file_id
    cur = db.execute(
        "INSERT INTO orders(user_id, username, product_key, product_name, price, receipt_file_id, created_at) VALUES(?,?,?,?,?,?,?)",
        (message.from_user.id, message.from_user.username or "", key, p["name"], p["price"], file_id, datetime.now().isoformat())
    )
    order_id = cur.lastrowid
    db.commit()
    await state.clear()

    await message.answer(
        f"✅ رسید دریافت شد.\n"
        f"شماره سفارش: <b>#{order_id}</b>\n\n"
        "پس از بررسی پرداخت، سفارش شما تأیید می‌شود.",
        parse_mode="HTML",
        reply_markup=main_kb()
    )

    if ADMIN_ID:
        caption = (
            f"🧾 <b>سفارش جدید #{order_id}</b>\n\n"
            f"👤 کاربر: @{message.from_user.username or 'بدون یوزرنیم'}\n"
            f"🆔 ID: <code>{message.from_user.id}</code>\n"
            f"📦 {p['name']}\n"
            f"💰 {p['price']:,} تومان"
        )
        await bot.send_photo(ADMIN_ID, file_id, caption=caption, parse_mode="HTML",
                             reply_markup=admin_kb(order_id))

@dp.message(OrderState.waiting_receipt)
async def wrong_receipt(message: Message):
    await message.answer("لطفاً عکس واضح رسید پرداخت را ارسال کن.")

@dp.callback_query(F.data.startswith("approve:"))
async def approve(call: CallbackQuery, state: FSMContext):
    if call.from_user.id != ADMIN_ID:
        await call.answer("دسترسی ندارید.", show_alert=True)
        return
    order_id = int(call.data.split(":")[1])
    row = db.execute("SELECT user_id, product_name FROM orders WHERE id=? AND status='pending'", (order_id,)).fetchone()
    if not row:
        await call.answer("این سفارش قبلاً بررسی شده.", show_alert=True)
        return
    db.execute("UPDATE orders SET status='approved' WHERE id=?", (order_id,))
    db.commit()
    await state.set_state(OrderState.waiting_config)
    await state.update_data(order_id=order_id, target_user_id=row[0])
    await call.message.answer(
        f"✅ پرداخت سفارش #{order_id} تأیید شد.\n"
        f"حالا کانفیگ مربوط به سفارش را به صورت متن ارسال کن."
    )
    await call.answer("پرداخت تأیید شد.")

@dp.callback_query(F.data.startswith("reject:"))
async def reject(call: CallbackQuery):
    if call.from_user.id != ADMIN_ID:
        await call.answer("دسترسی ندارید.", show_alert=True)
        return
    order_id = int(call.data.split(":")[1])
    row = db.execute("SELECT user_id FROM orders WHERE id=? AND status='pending'", (order_id,)).fetchone()
    if not row:
        await call.answer("این سفارش قبلاً بررسی شده.", show_alert=True)
        return
    db.execute("UPDATE orders SET status='rejected' WHERE id=?", (order_id,))
    db.commit()
    await bot.send_message(row[0], f"❌ پرداخت سفارش #{order_id} تأیید نشد.\nدر صورت نیاز با پشتیبانی تماس بگیر.")
    await call.message.answer(f"❌ سفارش #{order_id} رد شد.")
    await call.answer("رد شد.")

@dp.message(OrderState.waiting_config, F.text)
async def send_config(message: Message, state: FSMContext):
    if message.from_user.id != ADMIN_ID:
        return
    data = await state.get_data()
    order_id = data["order_id"]
    user_id = data["target_user_id"]
    config = message.text.strip()
    db.execute("UPDATE orders SET status='completed', config=? WHERE id=?", (config, order_id))
    db.commit()
    await bot.send_message(
        user_id,
        f"🎉 <b>سفارش #{order_id} آماده است.</b>\n\n"
        f"🔐 کانفیگ شما:\n<code>{config}</code>\n\n"
        "ممنون از خرید شما ❤️",
        parse_mode="HTML"
    )
    await message.answer(f"✅ کانفیگ سفارش #{order_id} برای مشتری ارسال شد.")
    await state.clear()

@dp.callback_query(F.data == "payment")
async def payment(call: CallbackQuery):
    await call.message.answer(
        f"💳 <b>اطلاعات پرداخت</b>\n\n"
        f"شماره کارت:\n<code>{CARD_NUMBER}</code>\n"
        f"به نام: <b>{CARD_OWNER}</b>\n\n"
        "پس از پرداخت، از بخش «خرید کانفیگ» رسید را ارسال کن.",
        parse_mode="HTML"
    )
    await call.answer()

@dp.callback_query(F.data == "support")
async def support(call: CallbackQuery):
    await call.message.answer("📞 برای پشتیبانی، پیام خودت را همینجا ارسال کن تا در نسخه بعدی به پنل پشتیبانی متصلش کنیم.")
    await call.answer()

@dp.callback_query(F.data == "orders")
async def orders(call: CallbackQuery):
    rows = db.execute(
        "SELECT id, product_name, price, status FROM orders WHERE user_id=? ORDER BY id DESC LIMIT 10",
        (call.from_user.id,)
    ).fetchall()
    if not rows:
        await call.message.answer("هنوز سفارشی ثبت نکردی.")
        await call.answer()
        return
    status_map = {"pending":"⏳ در انتظار بررسی", "approved":"🔄 در حال آماده‌سازی", "completed":"✅ تکمیل‌شده", "rejected":"❌ ردشده"}
    text = "📦 <b>سفارش‌های من</b>\n\n"
    for r in rows:
        text += f"#{r[0]} — {r[1]} — {r[2]:,} تومان\n{status_map.get(r[3], r[3])}\n\n"
    await call.message.answer(text, parse_mode="HTML")
    await call.answer()

async def main():
    if BOT_TOKEN == "PUT_YOUR_BOT_TOKEN_HERE" or not ADMIN_ID:
        raise RuntimeError("BOT_TOKEN و ADMIN_ID را در متغیرهای محیطی تنظیم کنید.")
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())
