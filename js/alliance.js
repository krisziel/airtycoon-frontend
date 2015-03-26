var allianceAirlineList;
var allianceView;
var alliance = {};
var allianceList = [];

function loadAlliance() {
	loadAllianceAirlines();
	$('#allianceList').on('click','.item[data-tab]',function(e){
		var tab = $(e.currentTarget);
		$('#allianceList .item[data-tab]').removeClass('active');
		$('#allianceList .item[data-tab=' + tab.attr('data-tab') + ']').addClass('active');
		$('#allianceList > div[data-tab]').css({display:'none'});
		$('#allianceList > div[data-tab=' + tab.attr('data-tab') + ']').css({display:'block'});
	});
}
function loadAllianceAirlines(id,el) {
	var id = id || 'own';
	$.getJSON(base + 'alliance/' + id + cookies.url).done(function(data){
		if(data.error) {
			loadAllianceList();
		} else {
			alliance = data;
			var allianceAirlines = [];
			_.each(data.airlines,function(airline){
				var allianceAirlineItem = new AllianceAirline(airline);
				allianceAirlines.push(allianceAirlineItem);
			});
			alliance.airlines = allianceAirlines;
			if(!el){
				alliance = new Alliance(alliance);
				new AllianceInfoView({el:'#allianceList',model:alliance});
				$('.chat.window').css({height:$('#leftColumn').height()-115});
				//launchChat();
				return alliance;
			} else {
		  	allianceAirlineList = new AllianceAirlineList(alliance.airlines);
				alliance = new Alliance(alliance);
				$('.airline.alliance.compressed').remove();
				$(el).after('<div class="airline alliance compressed">' + new AllianceAirlineListView().$el.html() + '</div>');
			}
		}
	});
}
function loadAllianceList(el) {
	el = el || '#allianceList';
	$.getJSON(base + 'alliance' + cookies.url).done(function(data){
		allianceList = [];
		_.each(data,function(alliance){
			var allianceItem = new Alliance(alliance);
			allianceList.push(allianceItem);
		});
		allianceList = new AllianceList(allianceList);
		new AllianceListView({el:el,model:allianceList});
	});
}

///// backbone

var Alliance = Backbone.Model.extend({
  initialize:function(){
  }
});
var AllianceAirline = Backbone.Model.extend({
  initialize:function(){
  }
});
var AllianceAirlineList = Backbone.Collection.extend({
  model:AllianceAirline
});
var AllianceList = Backbone.Collection.extend({
	model:Alliance
});
var AllianceAirlineView = Backbone.View.extend({ // Row that displays an airline's name/flights/aircraft in the airline list in alliance info view
  initialize:function(){
    this.render();
  },
  render:function(){
    var variables = this.model.attributes;
		variables.admin = alliance.attributes.admin;
    var template = _.template($('#allianceAirlineTemplate').html(),variables);
    this.$el.html(template);
    return this;
  }
});
var AllianceView = Backbone.View.extend({ // Actual row that shows an alliance and members in the list
  initialize:function(){
    this.render();
  },
  render:function(){
    var variables = this.model.attributes;
    var template = _.template($('#allianceTemplate').html(),variables);
    this.$el.html(template);
    return this;
  },
	events:{
		'click .ui.dividing.header.alliance':'loadAllianceInfo',
		'click .ui.button.green.micro.alliance.airline.eject':'requestAlliance'
	},
	loadAllianceInfo:function(){
		var id = this.model.attributes.id;
		if(alliance.id != id) {
			loadAllianceAirlines(id,'.ui.dividing.header.alliance[data-alliance=' + id + ']');
		}
	},
	requestAlliance:function(e){
		console.log(e);
		console.log('hi')
		console.log(this.model.attributes);
		
		$.post(base + 'alliance/' + this.model.attributes.id + '/request' + cookies.url).done(function(data){
			
		});
	}
});
var AllianceListView = Backbone.View.extend({ // The list of alliances displayed to user if they aren't in an alliance (AllianceInfoView)
	initialize:function(){
		this.render();
	},
  render:function(){
    this.addAll();
  },
  addOne:function(alliance){
    var view = new AllianceView({model: alliance});
    this.$el.append(view.$el);
  },
  addAll:function(){
    var template = _.template($('#newAllianceView').html());
    this.$el.html(template);
    allianceList.each(this.addOne,this);
  },
	events:{
		'click .ui.one.bottom.attached.buttons.create':'createAlliance'
	},
	createAlliance:function(){
	}
});
var AllianceAirlineListView = Backbone.View.extend({ // The view that combines all airlines into a list (using AllianceAirlineView)
  initialize:function(){
    this.render();
  },
  render:function(){
    this.addAll();
  },
  addOne:function(alliance){
    var view = new AllianceAirlineView({model: alliance});
    this.$el.append(view.$el);
  },
  addAll:function(){
    this.$el.html('');
    allianceAirlineList.each(this.addOne,this);
  }
});
var AllianceInfoView = Backbone.View.extend({ // The view that displays the alliance name/airlines and a list of all members
  initialize:function(){
    this.render();
  },
  render:function(){
		allianceAirlines = function(airlines){
		  allianceAirlineList = new AllianceAirlineList(airlines);
		  return new AllianceAirlineListView().$el.html();
		}
    var variables = this.model.attributes;
		variables.pending = 0;
		_.each(variables.airlines,function(airline){
			if(!airline.attributes.status) {
				variables.pending++;
			}
		});
    var template = _.template($('#allianceInfoTemplate').html(),variables);
		if(this.$el === '#allianceList') {
			this.$el.html(template);
		} else {
			this.$el.after(template);
		}
    return this;
  },
	events:{
		'click .ui.button.red.micro.alliance.airline.eject':'ejectAllianceAirline',
		'click .ui.button.red.micro.alliance.airline.reject':'rejectAllianceAirline',
		'click .ui.button.green.micro.alliance.airline.accept':'approveAllianceAirline'
	},
	ejectAllianceAirline:function(e){
		var airline = $(e.currentTarget).closest('.dividing.header');
		$.post(base + 'alliance/' + this.model.attributes.id + '/eject' + cookies.url + '&membership_id=' + airline.data('membership')).done(function(data){
			if(data.airline) {
				airline.remove();
			} else {
				
			}
		});
	},
	rejectAllianceAirline:function(e){
		var airline = $(e.currentTarget).closest('.dividing.header');
		$.post(base + 'alliance/' + this.model.attributes.id + '/reject' + cookies.url + '&membership_id=' + airline.data('membership')).done(function(data){
			if(data.airline) {
				airline.remove();
			} else {
				
			}
		});
	},
	approveAllianceAirline:function(e){
		var airline = $(e.currentTarget).closest('.dividing.header');
		$.post(base + 'alliance/' + this.model.attributes.id + '/approve' + cookies.url + '&membership_id=' + airline.data('membership')).done(function(data){
			if(data.airline) {
				airline.find('.airport.alliance.data div').remove();
				airline.find('.airport.alliance.data').append('<div class="ui button red micro alliance airline eject">Eject</div>');
			} else {
				
			}
		});
	}
});
