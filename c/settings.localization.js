/**
 * Localization settings module.
 */

(function(){
    
    /* SETTINGS */
    
    function LocalizationSettingsConstructor(){
        
        this.layer_name = 'localization_settings';
        
        this.save_params = {"type" : "stb", "action" : "set_locale"};
        
        this.superclass = SettingLayer.prototype;
        
        this.save_callback = function(result){
            _debug('save_callback', result);

            stb.msg.set_callback(function(){stb.ExecAction('reboot')});
            stb.msg.push(word['settings_saved_reboot']);

            var lang = this.save_params.locale.substr(0, 2);

            _debug('lang', lang);

            stb.RDir('setenv language ' + lang);

            var timezone = this.save_params.timezone;

            _debug('timezone', timezone);

            if (timezone != stb.timezone){
                stb.ExecAction('timezone ' + timezone);
                stb.RDir('setenv timezone_conf_int');
            }
        };
        
        this.load_default = function(){
            _debug('localization_settings.load_default');
            
            this.controls[0].set_default();
            this.controls[1].set_default();
            this.controls[2].set_default();
            this.controls[3].set_default();
        };
        
        this.load_map = function(){
            _debug('localization_settings.load_map');
            
            stb.load(
                {
                    "type"   : "stb",
                    "action" : "get_locales"
                },
                
                function(result){
                    _debug('localization_settings.load_map get_locales callback', result);
                    
                    this.locales = result;
                    
                    this.add_control(new OptionInput(this, {"name" : "locale", "label" : word['localization_label'], "map" : this.locales}));

                    this._load_countries();
                },
                
                this
            );
        };

        this._load_countries = function(){
             _debug('localization_settings._load_countries');
            
            stb.load(
                {
                    "type"   : "stb",
                    "action" : "get_countries"
                },

                function(result){
                    _debug('localization_settings.load_map get_countries callback', result);

                    this.countries = result;

                    this.country_option = this.add_control(new OptionInput(this, {"name" : "country", "label" : word['country_label'], "map" : this.countries}));

                    this.city_option = this.add_control(new OptionInput(this, {"name" : "city", "label" : word['city_label'], "map" : []}));

                    //this.timezone_option = this.add_control(new OptionInput(this, {"name" : "timezone", "label" : word['timezone_label'], "map" : []}));

                    this._load_timezones();

                    var self = this;

                    this.country_option.onchange = function(){

                        stb.load(
                            {
                                "type"       : "stb",
                                "action"     : "get_cities",
                                "country_id" : self.country_option.get_value()
                            },

                            function(result){
                                _debug('get_cities callback');
                                
                                self.city_option.fill(result);
                            },

                            self
                        );
                    }
                },

                this
            );
        };

        this._load_timezones = function(){
            _debug('localization_settings._load_timezones');

            stb.load(
                {
                    "type"   : "stb",
                    "action" : "get_timezones"
                },

                function(result){
                    _debug('_load_timezones callback');
                    
                    result = result || [];
                    
                    this.timezone_option = this.add_control(new OptionInput(this, {"name" : "timezone", "label" : word['timezone_label'], "map" : result}));

                    var self = this;

                    this.city_option.onchange = function(){
                        _debug('this.city_option.onchange');

                        var selected = self.city_option.get_selected();

                        _debug('selected', selected);

                        if (!selected || !selected.timezone){
                            return
                        }

                        _debug('selected.timezone', selected.timezone);

                        self.timezone_option.set_selected_by_value(selected.timezone);
                    }
                },

                this
            );
        };
        
        this.save = function(){
            _debug('localization_settings.save');
            
            this.get_input_value('default_lang');
            this.superclass.save.apply(this);
            
        }
    }
    
    LocalizationSettingsConstructor.prototype = new SettingLayer();
    
    var localization_settings = new LocalizationSettingsConstructor();
    
    localization_settings.init();
    
    localization_settings.load_map();
    
    localization_settings.bind();
    
    //localization_settings.init_left_ear(word['ears_back']);
    
    localization_settings.init_color_buttons([
        {"label" : word['parent_settings_cancel'], "cmd" : localization_settings.cancel},
        {"label" : word['parent_settings_save'], "cmd" : localization_settings.save},
        {"label" : word['empty'], "cmd" : ''},
        {"label" : word['empty'], "cmd" : ''}
    ]);
    
    localization_settings.color_buttons[localization_settings.color_buttons.getIdxByVal('color', 'yellow')].text_obj.setClass('disable_color_btn_text');
    localization_settings.color_buttons[localization_settings.color_buttons.getIdxByVal('color', 'blue')].text_obj.setClass('disable_color_btn_text');
    
    localization_settings.init_header_path(word['localization_settings_title']);
    
    localization_settings.hide();
    
    module.localization_settings = localization_settings;
    
    /* END SETTINGS */
    
    if (!module.settings_sub){
        module.settings_sub = [];
    }
    
    module.settings_sub.push({
        "title" : word['localization_settings_title'],
        "cmd"   : function(){
            main_menu.hide();
            module.localization_settings.show();
        }
    })
    
})();

loader.next();