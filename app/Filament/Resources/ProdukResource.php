<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ProdukResource\Pages;
use App\Filament\Resources\ProdukResource\RelationManagers;
use App\Models\Produk;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class ProdukResource extends Resource
{
    protected static ?string $model = Produk::class;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('product_name')
                    ->required()
                    ->maxLength(255),
                Forms\Components\TextInput::make('category')
                    ->required()
                    ->maxLength(255),
                Forms\Components\TextInput::make('brand')
                    ->required()
                    ->maxLength(255),
                Forms\Components\TextInput::make('type')
                    ->required()
                    ->maxLength(255),
                Forms\Components\TextInput::make('seller_name')
                    ->required()
                    ->maxLength(255),
                Forms\Components\TextInput::make('price')
                    ->required()
                    ->maxLength(255),
                Forms\Components\TextInput::make('selling_price')
                    ->required()
                    ->maxLength(255),
                Forms\Components\TextInput::make('buyer_sku_code')
                    ->required()
                    ->maxLength(255),
                Forms\Components\TextInput::make('buyer_product_status')
                    ->required()
                    ->maxLength(255),
                Forms\Components\Toggle::make('seller_product_status')
                    ->required(),
                Forms\Components\Toggle::make('unlimited_stock')
                    ->required(),
                Forms\Components\TextInput::make('stock')
                    ->required()
                    ->maxLength(255),
                Forms\Components\Toggle::make('multi')
                    ->required(),
                Forms\Components\TextInput::make('start_cut_off')
                    ->required()
                    ->maxLength(255),
                Forms\Components\TextInput::make('end_cut_off')
                    ->required()
                    ->maxLength(255),
                Forms\Components\TextInput::make('desc')
                    ->required()
                    ->maxLength(255),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('product_name')
                    ->searchable(),                
                Tables\Columns\TextColumn::make('category')
                    ->searchable(),
                Tables\Columns\TextColumn::make('brand')
                    ->searchable(),
                Tables\Columns\TextColumn::make('type')
                    ->searchable(),
                Tables\Columns\TextColumn::make('seller_name')
                    ->searchable(),
                Tables\Columns\TextColumn::make('price')
                    ->money('IDR')
                    ->searchable(),
                Tables\Columns\TextColumn::make('selling_price')
                    ->searchable()
                    ->money('IDR'),
                Tables\Columns\TextColumn::make('buyer_sku_code')
                    ->searchable(),
                Tables\Columns\TextColumn::make('buyer_product_status')
                    ->searchable(),
                Tables\Columns\IconColumn::make('seller_product_status')
                    ->boolean(),
                Tables\Columns\IconColumn::make('unlimited_stock')
                    ->boolean(),
                Tables\Columns\TextColumn::make('stock')
                    ->searchable(),
                Tables\Columns\IconColumn::make('multi')
                    ->boolean(),
                Tables\Columns\TextColumn::make('start_cut_off')
                    ->searchable(),
                Tables\Columns\TextColumn::make('end_cut_off')
                    ->searchable(),
                Tables\Columns\TextColumn::make('desc')
                    ->searchable(),
                // Tables\Columns\TextColumn::make('created_at')
                //     ->dateTime()
                //     ->sortable()
                //     ->toggleable(isToggledHiddenByDefault: true),
                // Tables\Columns\TextColumn::make('updated_at')
                //     ->dateTime()
                //     ->sortable()
                //     ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Filter::make('brand')->label('Brand'),
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
            'index' => Pages\ListProduks::route('/'),
            'create' => Pages\CreateProduk::route('/create'),
            'edit' => Pages\EditProduk::route('/{record}/edit'),
        ];
    }
}
