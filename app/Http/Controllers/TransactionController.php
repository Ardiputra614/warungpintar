<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{
    public function index()
    {
        $transactions = Transaction::orderBy('created_at', 'desc')->get();
        
        // Calculate stats
        $stats = [
            'totalRevenue' => $transactions->sum('gross_amount'),
            'totalTransactions' => $transactions->count(),
            'successRate' => $transactions->where('payment_status', 'success')->count() / max($transactions->count(), 1) * 100,
            'averageAmount' => $transactions->avg('gross_amount') ?? 0
        ];
        
        return Inertia::render('Admin/Transaction/Index', [
            'title' => 'Transaction History',
            'transaction' => $transactions,
            'stats' => $stats
        ]);
    }
    
    public function chartData()
    {
        // Daily transactions for last 7 days
        $daily = Transaction::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as count'),
                DB::raw('SUM(gross_amount) as revenue')
            )
            ->where('created_at', '>=', Carbon::now()->subDays(7))
            ->groupBy('date')
            ->orderBy('date')
            ->get();
        
        // Weekly data
        $weekly = Transaction::select(
                DB::raw('WEEK(created_at) as week'),
                DB::raw('COUNT(*) as count'),
                DB::raw('SUM(gross_amount) as revenue')
            )
            ->where('created_at', '>=', Carbon::now()->subWeeks(8))
            ->groupBy('week')
            ->orderBy('week')
            ->get();
        
        // Monthly data
        $monthly = Transaction::select(
                DB::raw('MONTH(created_at) as month'),
                DB::raw('COUNT(*) as count'),
                DB::raw('SUM(gross_amount) as revenue')
            )
            ->where('created_at', '>=', Carbon::now()->subMonths(6))
            ->groupBy('month')
            ->orderBy('month')
            ->get();
        
        return response()->json([
            'daily' => $daily,
            'weekly' => $weekly,
            'monthly' => $monthly
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|string|unique:transactions',
            'transaction_id' => 'nullable|string|unique:transactions',
            'gross_amount' => 'required|numeric',
            'payment_status' => 'required|string',
            'payment_method_name' => 'nullable|string',
            'wa_pembeli' => 'required|string',
            'product_name' => 'nullable|string',
            'customer_no' => 'required|string',
            'product_type' => 'nullable|string',
            'selling_price' => 'nullable|numeric',
            'purchase_price' => 'nullable|numeric',
            'digiflazz_status' => 'nullable|string',
            'status_message' => 'nullable|string',
            'serial_number' => 'nullable|string',
            'voucher_code' => 'nullable|string'
        ]);
        
        $transaction = Transaction::create($validated);
        
        return response()->json($transaction, 201);
    }

    public function update(Request $request, Transaction $transaction)
    {
        $validated = $request->validate([
            'order_id' => 'required|string|unique:transactions,order_id,' . $transaction->id,
            'transaction_id' => 'nullable|string|unique:transactions,transaction_id,' . $transaction->id,
            'gross_amount' => 'required|numeric',
            'payment_status' => 'required|string',
            'payment_method_name' => 'nullable|string',
            'wa_pembeli' => 'required|string',
            'product_name' => 'nullable|string',
            'customer_no' => 'required|string',
            'product_type' => 'nullable|string',
            'selling_price' => 'nullable|numeric',
            'purchase_price' => 'nullable|numeric',
            'digiflazz_status' => 'nullable|string',
            'status_message' => 'nullable|string',
            'serial_number' => 'nullable|string',
            'voucher_code' => 'nullable|string'
        ]);
        
        $transaction->update($validated);
        
        return response()->json($transaction->fresh());
    }

    public function destroy(Transaction $transaction)
    {
        $transaction->delete();
        return response()->json(['message' => 'Transaction deleted successfully']);
    }
}