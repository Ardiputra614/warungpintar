<?php

namespace App\Filament\Resources\GamesCategoryResource\Pages;

use App\Filament\Resources\GamesCategoryResource;
use Filament\Actions;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Support\Str;

class CreateGamesCategory extends CreateRecord
{
    protected static string $resource = GamesCategoryResource::class;

    protected function mutateFormDataBeforeCreate(array $data): array
    {        
        $data['slug'] = Str::slug($data['name']);
        return $data;
    }
}
