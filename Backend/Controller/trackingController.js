const { supabase } = require('../config/supabase');

const trackingController = {
  // Create tracking info
  createTracking: async (req, res) => {
    try {
      const { barter_request_id, tracking_number, shipping_method } = req.body;
      
      const { data: tracking, error } = await supabase
        .from('tracking_info')
        .insert([{
          barter_request_id,
          tracking_number,
          shipping_method: shipping_method || 'Standard postal',
          package_sent: true,
          package_sent_date: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      // Update barter request status
      await supabase
        .from('barter_requests')
        .update({ status: 'shipped' })
        .eq('id', barter_request_id);
      
      res.status(201).json({ message: 'Tracking info created successfully', tracking });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get tracking info
  getTracking: async (req, res) => {
    try {
      const { barter_request_id } = req.params;
      
      const { data: tracking, error } = await supabase
        .from('tracking_info')
        .select(`
          *,
          barter_requests:barter_request_id (
            *,
            from_user:from_user_id (id, name, profile_picture),
            to_user:to_user_id (id, name, profile_picture),
            from_item:from_item_id (name),
            to_item:to_item_id (name)
          )
        `)
        .eq('barter_request_id', barter_request_id)
        .single();
      
      if (error) {
        return res.status(404).json({ error: 'Tracking info not found' });
      }
      
      res.json({ tracking });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update tracking status
  updateTrackingStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, notes, tracking_number } = req.body;
      
      let updateData = { notes, updated_at: new Date().toISOString() };
      
      switch (status) {
        case 'item_packed':
          updateData.item_packed = true;
          updateData.item_packed_date = new Date().toISOString();
          break;
        case 'dispatched':
          updateData.package_sent = true;
          updateData.package_sent_date = new Date().toISOString();
          if (tracking_number) updateData.tracking_number = tracking_number;
          break;
        case 'received':
          updateData.package_delivered = true;
          updateData.package_delivered_date = new Date().toISOString();
          updateData.exchange_started = true;
          updateData.exchange_started_date = new Date().toISOString();
          break;
        case 'return_packed':
          updateData.return_packed = true;
          updateData.return_packed_date = new Date().toISOString();
          break;
        case 'return_dispatched':
          updateData.return_sent = true;
          updateData.return_sent_date = new Date().toISOString();
          if (tracking_number) updateData.return_tracking_number = tracking_number;
          break;
        case 'return_received':
          updateData.return_delivered = true;
          updateData.return_delivered_date = new Date().toISOString();
          updateData.exchange_completed = true;
          updateData.exchange_completed_date = new Date().toISOString();
          break;
      }
      
      const { data: tracking, error } = await supabase
        .from('tracking_info')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      // Update barter request status
      let barterStatus = 'accepted';
      if (status === 'dispatched') barterStatus = 'shipped';
      if (status === 'received') barterStatus = 'ongoing';
      if (status === 'return_received') barterStatus = 'completed';
      
      await supabase
        .from('barter_requests')
        .update({ status: barterStatus })
        .eq('id', tracking.barter_request_id);
      
      res.json({ message: 'Tracking status updated successfully', tracking });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get tracking timeline
  getTrackingTimeline: async (req, res) => {
    try {
      const { barter_request_id } = req.params;
      
      const { data: tracking, error } = await supabase
        .from('tracking_info')
        .select('*')
        .eq('barter_request_id', barter_request_id)
        .single();
      
      if (error) {
        return res.status(404).json({ error: 'Tracking info not found' });
      }
      
      // Build timeline
      const timeline = [
        {
          step: 'Item Packed',
          completed: tracking.item_packed,
          date: tracking.item_packed_date
        },
        {
          step: 'Item Dispatched',
          completed: tracking.package_sent,
          date: tracking.package_sent_date,
          tracking_number: tracking.tracking_number
        },
        {
          step: 'Item Received',
          completed: tracking.package_delivered,
          date: tracking.package_delivered_date
        },
        {
          step: 'Exchange Period',
          completed: tracking.exchange_started,
          date: tracking.exchange_started_date
        },
        {
          step: 'Return Packed',
          completed: tracking.return_packed,
          date: tracking.return_packed_date
        },
        {
          step: 'Return Dispatched',
          completed: tracking.return_sent,
          date: tracking.return_sent_date,
          tracking_number: tracking.return_tracking_number
        },
        {
          step: 'Return Received',
          completed: tracking.return_delivered,
          date: tracking.return_delivered_date
        },
        {
          step: 'Exchange Complete',
          completed: tracking.exchange_completed,
          date: tracking.exchange_completed_date
        }
      ];
      
      res.json({ timeline, tracking });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = trackingController;