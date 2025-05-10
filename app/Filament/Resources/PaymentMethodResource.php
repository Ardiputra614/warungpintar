<?php

namespace App\Filament\Resources;

use App\Filament\Resources\PaymentMethodResource\Pages;
use App\Models\PaymentMethod;
use Filament\Forms;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\Console\Input\InputOption;

class PaymentMethodResource extends Resource
{
    protected static ?string $model = PaymentMethod::class;

    protected static ?string $navigationIcon = 'heroicon-o-wallet';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                TextInput::make('name')->required(),
                TextInput::make('nominal_fee')->numeric()->required(),
                TextInput::make('percentase_fee')->numeric(),
                Select::make('type')
                    ->options([
                        'cc' => 'CREDIT CARD',
                        'qris' => 'QRIS',
                        'bank_transfer' => 'BANK TRANSFER/VA',
                        'ewallet' => 'E-WALLET',
                        'cstore' => 'CONVENSIONAL STORE',
                    ]),                
                Select::make('status')
                    ->options([
                        'on' => 'ON',
                        'off' => 'OFF',                        
                    ]),
                FileUpload::make('logo')
                    ->disk('public')
                    ->directory('payment') // ⬅️ Tambahkan ini
                    ->image()
                    ->imageEditor() // opsional: bisa crop/resize
                    ->required(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')->sortable()->searchable(),
                TextColumn::make('nominal_fee')->money('IDR')->sortable(),
                TextColumn::make('percentase_fee')->sortable(),
                TextColumn::make('status')->badge()->sortable(),                
                ImageColumn::make('logo')
                    ->disk('public')
                    // ->directory('payment') // ⬅️ Tambahkan ini
                    // ->getStateUsing(fn ($record) => 'payment/' . $record->logo)
                    ->height(50)
                    ->width(50)
                    // ->defaultImageUrl(asset('images/default-logo.png')), // ⬅️ Optional fallback
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
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListPaymentMethods::route('/'),
            'create' => Pages\CreatePaymentMethod::route('/create'),
            'edit' => Pages\EditPaymentMethod::route('/{record}/edit'),
        ];
    }   
}
