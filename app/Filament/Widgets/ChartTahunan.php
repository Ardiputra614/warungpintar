<?php

namespace App\Filament\Widgets;

use App\Models\Transaction;
use Carbon\Carbon;
use Filament\Widgets\ChartWidget;

class ChartTahunan extends ChartWidget
{
    protected static ?string $heading = 'Chart';

    protected function getData(): array
    {
        $year = collect(range(0, 6))->map(function ($i) {
            return Carbon::today()->subDays($i)->format('Y-m-d');
        })->reverse();

        $counts = $year->map(function ($day) {
            return Transaction::whereDate('created_at', $day)->count();
        });

        return [
            'datasets' => [
                [
                    'label' => 'Transaksi per Tahun',
                    'data' => $counts,
                    'backgroundColor' => '#3b82f6',
                ],
            ],
            'labels' => $year->map(fn ($day) => Carbon::parse($day)->format('d M')),
        ];       
    }

    protected function getType(): string
    {
        return 'bar';
    }
}
