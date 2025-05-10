<?php

namespace App\Filament\Resources\ProfilAplikasiResource\Pages;

use App\Filament\Resources\ProfilAplikasiResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditProfilAplikasi extends EditRecord
{
    protected static string $resource = ProfilAplikasiResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
