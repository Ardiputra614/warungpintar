<?php

namespace App\Filament\Widgets;

use App\Models\Transaction;
use Carbon\Carbon;
use Filament\Widgets\ChartWidget;

class ChartMingguan extends ChartWidget
{
    protected static ?string $heading = 'Chart';

    protected function getData(): array
    {
        // return [
        //     //
        // ];
        $weeks = collect(range(0, 5))->map(function ($i) {
            $start = Carbon::now()->subWeeks($i)->startOfWeek();
            return $start->format('Y-m-d');
        })->reverse();

        $counts = $weeks->map(function ($start) {
            $end = Carbon::parse($start)->endOfWeek();
            return Transaction::whereBetween('created_at', [$start, $end])->count();
        });

        return [
            'datasets' => [
                [
                    'label' => 'Transaksi per Hari',
                    'data' => $counts,
                    'backgroundColor' => '#3b82f6',
                ],
            ],
            'labels' => $weeks->map(fn ($weeks) => Carbon::parse($weeks)->format('d M')),
        ];

    }

    protected function getType(): string
    {
        return 'bar';
    }
}
