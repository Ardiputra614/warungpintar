<?php

namespace App\Filament\Resources;

use App\Filament\Resources\GamesCategoryResource\Pages;
use App\Filament\Resources\GamesCategoryResource\RelationManagers;
use App\Models\GamesCategory;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class GamesCategoryResource extends Resource
{
    protected static ?string $model = GamesCategory::class;

    protected static ?string $navigationIcon = 'heroicon-o-device-phone-mobile';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('name')
                    ->required()                    
                    ->maxLength(255),                
                Forms\Components\FileUpload::make('logo')
                    ->required()
                    ->image()
                    ->imageEditor()
                    ->disk('public')
                    ->directory('games'),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->searchable(),
                Tables\Columns\TextColumn::make('slug')
                    ->searchable(),
                Tables\Columns\ImageColumn::make('logo')
                    ->disk('public'),
            ])
            ->filters([
                //
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
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
            'index' => Pages\ListGamesCategories::route('/'),
            'create' => Pages\CreateGamesCategory::route('/create'),
            'edit' => Pages\EditGamesCategory::route('/{record}/edit'),
        ];
    }
}
