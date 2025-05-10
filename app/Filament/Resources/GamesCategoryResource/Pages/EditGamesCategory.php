<?php

namespace App\Filament\Resources\GamesCategoryResource\Pages;

use App\Filament\Resources\GamesCategoryResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class EditGamesCategory extends EditRecord
{
    protected static string $resource = GamesCategoryResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }

    protected function mutateFormDataBeforeSave(array $data): array
    {
         if ($data['name'] !== $this->record->name) {
        $data['slug'] = Str::slug($data['name']);
        }
        
        // Hapus file lama jika user upload file baru
        if (
            isset($data['logo']) &&
            $this->record->logo &&
            $data['logo'] !== $this->record->logo &&
            Storage::disk('public')->exists($this->record->logo)
        ) {
            Storage::disk('public')->delete($this->record->logo);
        }

        return $data;
    }
}
