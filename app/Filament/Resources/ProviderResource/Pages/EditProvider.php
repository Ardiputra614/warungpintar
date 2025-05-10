<?php

namespace App\Filament\Resources\ProviderResource\Pages;

use App\Filament\Resources\ProviderResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;
use Illuminate\Support\Facades\Storage;

class EditProvider extends EditRecord
{
    protected static string $resource = ProviderResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }

    protected function mutateFormDataBeforeSave(array $data): array
    {
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
