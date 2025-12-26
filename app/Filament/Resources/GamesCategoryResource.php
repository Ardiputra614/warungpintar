<?php

namespace App\Filament\Resources;

use App\Filament\Resources\GamesCategoryResource\Pages;
use App\Filament\Resources\GamesCategoryResource\RelationManagers;
use App\Models\GamesCategory;
use Filament\Forms;
use Filament\Forms\Components\Grid;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Tabs;
use Filament\Forms\Form;
use Filament\Forms\Set;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;
use Illuminate\Support\Str;

class GamesCategoryResource extends Resource
{
    protected static ?string $model = GamesCategory::class;

    protected static ?string $navigationIcon = 'heroicon-o-device-phone-mobile';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Tabs::make('Kategori Game')
                    ->tabs([
                        Tabs\Tab::make('Informasi Dasar') // Perbaikan di sini: Tabs\Tab::make()
                            ->icon('heroicon-o-information-circle')
                            ->schema([
                                Grid::make(2)
                                    ->schema([
                                        Section::make('Identitas Game')
                                            ->schema([
                                                Forms\Components\TextInput::make('name')
                                                    ->required()
                                                    ->maxLength(255)
                                                    ->live(onBlur: true)
                                                    ->afterStateUpdated(function ($state, Set $set) {
                                                        $set('slug', Str::slug($state));
                                                        $set('meta_title', $state . ' - Top Up Murah & Aman');
                                                    }),
                                                Forms\Components\TextInput::make('slug')
                                                    ->required()
                                                    ->maxLength(255)
                                                    ->unique('games_categories', 'slug', ignoreRecord: true),
                                                Forms\Components\ColorPicker::make('color')
                                                    ->default('#3B82F6'),
                                            ]),

                                        Section::make('Logo & Ikon')
                                            ->schema([
                                                Forms\Components\FileUpload::make('logo')
                                                    ->image()
                                                    ->imageEditor()
                                                    ->disk('public')
                                                    ->directory('games/logos')
                                                    ->label('Logo Utama')
                                                    ->helperText('Ukuran direkomendasikan: 512x512 px'),
                                                Forms\Components\FileUpload::make('icon')
                                                    ->image()
                                                    ->disk('public')
                                                    ->directory('games/icons')
                                                    ->label('Ikon Kecil')
                                                    ->helperText('Ukuran direkomendasikan: 64x64 px'),
                                                Forms\Components\Select::make('category')
                                                    ->options([
                                                        'provider' => 'Provider', 'pln' => 'PLN', 'games' => 'Games', 'prabayar' => 'Prabayar'
                                                    ])                                            
                                                    ->required()
                                                    ->label('Kategory'),
                                                Forms\Components\Select::make('is_active')
                                                    ->options([
                                                        true => 'ON', false => 'OFF'
                                                    ])                                            
                                                    ->required()
                                                    ->label('ACTIVE'),
                                            ]),

                                    ]),

                                Section::make('Deskripsi')
                                    ->schema([
                                        Forms\Components\Textarea::make('description')
                                            ->rows(3)
                                            ->nullable()
                                            ->label('Deskripsi Singkat'),
                                        Forms\Components\RichEditor::make('how_to_topup')                                            
                                            ->nullable()
                                            ->label('Cara Top Up'),
                                        Forms\Components\Textarea::make('notes')
                                            ->rows(3)
                                            ->nullable()
                                            ->label('Catatan Penting'),
                                    ]),
                            ]),

                        Tabs\Tab::make('Format Nomor Pelanggan') // Perbaikan di sini: Tabs\Tab::make()
                            ->icon('heroicon-o-user-circle')
                            ->schema([
                                Section::make('Konfigurasi Format')
                                    ->description('Atur format input data akun untuk game ini')
                                    ->schema([
                                        Forms\Components\Select::make('customer_no_format')
                                            ->options([                                                
                                                'dua_input' => 'Dua input',                                                 
                                                'satu_input' => 'Satu input',
                                            ])
                                            ->default('user_id')
                                            ->live()
                                            ->required()
                                            ->label('Format Data Akun'),

                                        Forms\Components\TextInput::make('example_format')
                                            ->label('Contoh Format')
                                            ->placeholder('Contoh: 123456789+1234')
                                            ->helperText('Contoh yang akan ditampilkan ke user')
                                            ->nullable()
                                            ->maxLength(255),

                                        Forms\Components\Textarea::make('format_description')
                                            ->label('Deskripsi Format')
                                            ->rows(2)
                                            ->placeholder('Masukkan User ID dan Server ID dengan dipisahkan tanda +')
                                            ->helperText('Penjelasan cara pengisian data akun')
                                            ->nullable(),
                                    ]),

                                Section::make('Field Input')
                                    ->description('Konfigurasi label dan placeholder untuk form')
                                    ->schema([
                                        Grid::make(2)
                                            ->schema([
                                                Forms\Components\TextInput::make('field1_label')
                                                    ->label('Label Field 1')
                                                    ->default('User ID')
                                                    ->required(),
                                                Forms\Components\TextInput::make('field1_placeholder')
                                                    ->label('Placeholder Field 1')
                                                    ->default('Masukkan User ID')
                                                    ->required(),
                                            ]),

                                        Forms\Components\Group::make()
                                            ->schema([
                                                Forms\Components\TextInput::make('field2_label')
                                                    ->label('Label Field 2')
                                                    ->nullable()
                                                    ->visible(fn (Forms\Get $get): bool => 
                                                        in_array($get('customer_no_format'), [
                                                            'satu_input', 
                                                            'dua_input',                                                             
                                                        ])
                                                    ),
                                                Forms\Components\TextInput::make('field2_placeholder')
                                                    ->label('Placeholder Field 2')
                                                    ->nullable()
                                                    ->visible(fn (Forms\Get $get): bool => 
                                                        in_array($get('customer_no_format'), [
                                                            'satu_input', 
                                                            'dua_input',
                                                        ])
                                                    ),
                                                Forms\Components\TextInput::make('separator')
                                                    ->label('Separator/Pemisah')
                                                    ->placeholder('Contoh: +, #, ,')
                                                    ->helperText('Karakter pemisah antara field 1 dan 2')
                                                    ->nullable()
                                                    ->visible(fn (Forms\Get $get): bool => 
                                                        in_array($get('customer_no_format'), [
                                                            'satu_input', 
                                                            'dua_input',
                                                        ])
                                                    ),
                                            ]),
                                    ]),

                                // Section::make('Validasi')
                                //     ->schema([
                                //         Forms\Components\Textarea::make('validation_rules')
                                //             ->label('Aturan Validasi')
                                //             ->rows(2)
                                //             ->helperText('Aturan validasi dalam format JSON. Contoh: {"user_id": "required|numeric", "server_id": "required"}')
                                //             ->nullable(),
                                //     ]),
                            ]),                                                    
                    ])
                    ->columnSpanFull(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\ImageColumn::make('logo')
                    ->label('Logo')
                    ->disk('public')
                    ->circular()
                    ->size(50),

                Tables\Columns\TextColumn::make('name')
                    ->label('Nama Game')
                    ->searchable()
                    ->sortable(),                    

                Tables\Columns\TextColumn::make('category')
                    ->label('Kategory')
                    ->searchable()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('slug')
                    ->label('Slug')
                    ->searchable()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('customer_no_format')
                    ->label('Format')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {                        
                        'satu_input' => 'red',                        
                        default => 'gray',
                    })
                    ->formatStateUsing(fn (string $state): string => match ($state) {                        
                        'satu_input' => 'Satu Input',
                        'dua_input' => 'Dua Input',
                        default => $state,
                    }),                

                Tables\Columns\IconColumn::make('is_active')
                    ->label('Aktif')
                    ->boolean()
                    ->sortable(),

                Tables\Columns\IconColumn::make('is_featured')
                    ->label('Featured')
                    ->boolean()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\IconColumn::make('is_popular')
                    ->label('Populer')
                    ->boolean()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Dibuat')
                    ->dateTime('d/m/Y H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('updated_at')
                    ->label('Diupdate')
                    ->dateTime('d/m/Y H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('customer_no_format')
                    ->label('Format Data Akun')
                    ->options([                    
                        'dua_input' => 'Dua Input',
                        'satu_input' => 'Satu Input',
                    ]),

                Tables\Filters\TernaryFilter::make('is_active')
                    ->label('Status Aktif'),

                Tables\Filters\TernaryFilter::make('is_featured')
                    ->label('Featured'),

                Tables\Filters\TernaryFilter::make('is_popular')
                    ->label('Populer'),

                Tables\Filters\Filter::make('created_at')
                    ->form([
                        Forms\Components\DatePicker::make('created_from')
                            ->label('Dari Tanggal'),
                        Forms\Components\DatePicker::make('created_until')
                            ->label('Sampai Tanggal'),
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        return $query
                            ->when(
                                $data['created_from'],
                                fn (Builder $query, $date): Builder => $query->whereDate('created_at', '>=', $date),
                            )
                            ->when(
                                $data['created_until'],
                                fn (Builder $query, $date): Builder => $query->whereDate('created_at', '<=', $date),
                            );
                    }),
            ])
            ->actions([
                Tables\Actions\ActionGroup::make([
                    Tables\Actions\ViewAction::make(),
                    Tables\Actions\EditAction::make(),
                    Tables\Actions\DeleteAction::make(),
                ]),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                    Tables\Actions\BulkAction::make('markActive')
                        ->label('Aktifkan')
                        ->icon('heroicon-o-check-circle')
                        ->action(function ($records) {
                            $records->each->update(['is_active' => true]);
                        })
                        ->requiresConfirmation(),
                    Tables\Actions\BulkAction::make('markInactive')
                        ->label('Nonaktifkan')
                        ->icon('heroicon-o-x-circle')
                        ->action(function ($records) {
                            $records->each->update(['is_active' => false]);
                        })
                        ->requiresConfirmation(),
                ]),
            ])
            ->defaultSort('sort_order', 'asc')
            ->reorderable('sort_order');
    }

    public static function getRelations(): array
    {
        return [
            // Anda bisa menambahkan relation managers di sini
            // RelationManagers\ProductsRelationManager::class,
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

    public static function getNavigationBadge(): ?string
    {
        return static::getModel()::where('is_active', true)->count();
    }

    public static function getNavigationBadgeColor(): string|array|null
    {
        return 'success';
    }
}