<?php

namespace App\Filament\Resources\TagihanResource\Pages;

use App\Filament\Resources\TagihanResource;
use Filament\Actions;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Support\Str;

class CreateTagihan extends CreateRecord
{
    protected static string $resource = TagihanResource::class;

     protected function mutateFormDataBeforeCreate(array $data): array
    {        
        $data['slug'] = Str::slug($data['name']);
        return $data;
    }
}
