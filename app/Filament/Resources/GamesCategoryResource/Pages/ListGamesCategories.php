<?php

namespace App\Filament\Resources\GamesCategoryResource\Pages;

use App\Filament\Resources\GamesCategoryResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListGamesCategories extends ListRecords
{
    protected static string $resource = GamesCategoryResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
