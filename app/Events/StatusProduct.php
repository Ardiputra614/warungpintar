<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;

class StatusProduct implements ShouldBroadcast
{
    use SerializesModels;

    public $data;

    public function __construct($sku, $buyerStatus, $sellerStatus)
    {
        $this->data = [
            'buyer_sku_code' => $sku,
            'buyer_product_status' => (bool)$buyerStatus,
            'seller_product_status' => (bool)$sellerStatus,
            'is_active' => (bool)$buyerStatus && (bool)$sellerStatus,
            'timestamp' => now()->toDateTimeString(),
        ];
    }

    public function broadcastOn()
    {       
        return new Channel('produk-status');
    }

    public function broadcastAs()
    {
        return 'produk.updated';
    }
    
    public function broadcastWith()
    {
        return $this->data;
    }
}