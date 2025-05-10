<?php

namespace App\Filament\Resources\PaymentMethodResource\Pages;

use App\Filament\Resources\PaymentMethodResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;
use Illuminate\Support\Facades\Storage;

class EditPaymentMethod extends EditRecord
{
    protected static string $resource = PaymentMethodResource::class;

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
