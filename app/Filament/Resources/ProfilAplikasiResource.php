<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ProfilAplikasiResource\Pages;
use App\Filament\Resources\ProfilAplikasiResource\RelationManagers;
use App\Models\ProfilAplikasi;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class ProfilAplikasiResource extends Resource
{
    protected static ?string $model = ProfilAplikasi::class;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('application_name')
                    ->required()
                    ->maxLength(255),
                Forms\Components\TextInput::make('application_fee')
                    ->required()
                    ->maxLength(255)
                    ->numeric(),
                Forms\Components\FileUpload::make('logo')
                    ->required()
                    ->image()
                    ->imageEditor()
                    ->disk('public')
                    ->directory('aplikasi'),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('application_name')
                    ->searchable(),
                Tables\Columns\TextColumn::make('application_fee')
                    ->searchable()
                    ->money('IDR'),
                Tables\Columns\ImageColumn::make('logo')
                ->disk('public')
                ->height(50)
                ->width(50),
            ])
            ->filters([
                //
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                // Tables\Actions\BulkActionGroup::make([
                //     Tables\Actions\DeleteBulkAction::make(),
                // ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListProfilAplikasis::route('/'),
            'create' => Pages\CreateProfilAplikasi::route('/create'),
            'edit' => Pages\EditProfilAplikasi::route('/{record}/edit'),
        ];
    }
}
